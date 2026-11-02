import {randomBytes, randomUUID} from 'node:crypto'
import {createClient, type SanityClient} from '@sanity/client'
import {documentEventHandler} from '@sanity/functions'
import {API_VERSION, SCHEMA_ID} from '../../lib/config'
import {briefContent, type BriefEvent} from './briefSource'
import {runBuild, type LibraryEntry} from './harness'
import type {BuildOutput} from './pageSchema'
import {toPageDocument, type ImageJob, type LibraryImage} from './toSanity'

type Event = BriefEvent & {status?: string; submittedVia?: string; buildRequestedAt?: string}

const DAILY_CAP = Number(process.env.BUILD_DAILY_CAP ?? 50)

export const handler = documentEventHandler<Event>(async ({context, event}) => {
  const brief = event.data
  // Raw perspective: slug de-duplication has to see other Builds' Draft pages
  const client = createClient({...context.clientOptions, apiVersion: API_VERSION, useCdn: false, perspective: 'raw'})
  const buildKey = randomUUID().replaceAll('-', '').slice(0, 12)
  const at = (field: string) => `builds[_key == "${buildKey}"].${field}`

  if (brief.status === 'building') {
    console.log(`Brief ${brief._id} is already building; ignoring this request`)
    return
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const recent = await client.fetch<number>(
    `math::sum(*[_type == "brief"]{"n": count(builds[startedAt > $since])}.n)`,
    {since},
  )

  await client
    .patch(brief._id)
    .set({status: 'building'})
    .setIfMissing({builds: []})
    .append('builds', [
      {_key: buildKey, _type: 'buildReport', startedAt: new Date().toISOString(), model: process.env.BUILD_MODEL},
    ])
    .commit()

  try {
    if ((recent ?? 0) >= DAILY_CAP) throw new Error(`Daily Build cap of ${DAILY_CAP} reached`)

    const contextToken = process.env.SANITY_CONTEXT_TOKEN
    if (!contextToken) throw new Error('SANITY_CONTEXT_TOKEN is not set')

    const [content, rulesSyncedAt, library] = await Promise.all([
      briefContent(brief),
      client.fetch<string | null>(`*[_id == "rulesSyncStatus"][0].lastRefreshAt`),
      client.fetch<(LibraryEntry & LibraryImage)[]>(
        `*[_type == "libraryImage" && !(_id in path("drafts.**")) && defined(image.asset)]{_id, title, description, kind, products, "assetId": image.asset._ref, "alt": image.alt}`,
      ),
    ])
    const output = await runBuild({
      brief: content,
      library: library.map(({_id, title, description, kind, products}) => ({_id, title, description, kind, products})),
      contextToken,
      model: process.env.BUILD_MODEL ?? 'claude-opus-5-5',
    })

    const pageId = `drafts.${randomUUID()}`
    const slug = await uniqueSlug(client, output.page.slug)
    const previewToken = randomBytes(24).toString('base64url')
    const previewUrl = `${process.env.PREVIEW_BASE_URL ?? 'http://localhost:3000'}/preview/${previewToken}`

    const {document, imageJobs, imagesPlaced} = toPageDocument({...output.page, slug}, library)
    await client.create({...document, _id: pageId, brief: {_type: 'reference', _ref: brief._id, _weak: true}, buildKey})
    const imagesGenerated = await generateImages(client, pageId, imageJobs)

    await client
      .patch(brief._id)
      .set({
        status: 'done',
        [at('finishedAt')]: new Date().toISOString(),
        [at('pageId')]: pageId,
        [at('slug')]: slug,
        [at('previewToken')]: previewToken,
        [at('previewUrl')]: previewUrl,
        ...(rulesSyncedAt ? {[at('rulesSyncedAt')]: rulesSyncedAt} : {}),
        [at('appliedRules')]: await ruleReferences(client, output),
        [at('dropped')]: output.report.dropped,
        [at('imagesPlaced')]: imagesPlaced,
        [at('imagesGenerated')]: imagesGenerated,
        [at('placeholders')]: output.report.placeholders,
        [at('gaps')]: output.report.gaps,
      })
      .commit()

    await notifySlack(`Build ready for “${brief.title}”: ${previewUrl}`)
    console.log(`Built ${pageId} from ${brief._id}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Build failed for ${brief._id}:`, error)
    await client
      .patch(brief._id)
      .set({status: 'failed', [at('finishedAt')]: new Date().toISOString(), [at('error')]: message})
      .commit()
  }
})

// One Agent Actions call per prompt slot, generating straight into the Draft page's image asset.
// Generation finishes asynchronously; a slot that fails to start stays a Placeholder.
async function generateImages(client: SanityClient, pageId: string, jobs: ImageJob[]): Promise<string[]> {
  const agent = client.withConfig({apiVersion: 'vX'})
  const results = await Promise.all(
    jobs.map(async (job) => {
      try {
        await agent.agent.action.generate({
          schemaId: SCHEMA_ID,
          documentId: pageId,
          instruction: job.prompt,
          target: {path: [...job.path, 'asset']},
        })
        return `Generated: ${job.prompt}`
      } catch (error) {
        console.error('Image generation failed:', error)
        return `Not generated (${error instanceof Error ? error.message : 'error'}): ${job.prompt}`
      }
    }),
  )
  return results
}

async function uniqueSlug(client: SanityClient, wanted: string) {
  const taken = new Set(
    await client.fetch<string[]>(
      `*[_type == "pageBuilderPage" && string::startsWith(slug.current, $wanted)].slug.current`,
      {wanted},
    ),
  )
  let slug = wanted
  for (let n = 2; taken.has(slug); n++) slug = `${wanted}-${n}`
  return slug
}

// Map the Rules the model cites to Rule documents: by id when the Knowledge Base exposed one,
// otherwise by exact statement
async function ruleReferences(client: SanityClient, output: BuildOutput) {
  const cited = output.report.appliedRules
  const found = await client.fetch<{_id: string; statement: string}[]>(
    `*[_type == "rule" && !(_id in path("drafts.**")) && (_id in $ids || statement in $statements)]{_id, statement}`,
    {ids: cited.flatMap((rule) => rule.ruleId ?? []), statements: cited.map((rule) => rule.statement)},
  )
  return found.map((rule) => ({_key: rule._id.replace(/\W/g, ''), _type: 'reference', _ref: rule._id, _weak: true}))
}

async function notifySlack(text: string) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  await fetch(url, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({text})}).catch(
    (error) => console.warn('Slack notification failed:', error),
  )
}
