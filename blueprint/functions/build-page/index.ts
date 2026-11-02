import {randomBytes, randomUUID} from 'node:crypto'
import {createClient, type SanityClient} from '@sanity/client'
import {documentEventHandler} from '@sanity/functions'
import {API_VERSION} from '../../lib/config'
import {briefContent, type BriefEvent} from './briefSource'
import {runBuild} from './harness'
import type {BuildOutput} from './pageSchema'
import {toPageDocument} from './toSanity'

type Event = BriefEvent & {status?: string; submittedVia?: string; buildRequestedAt?: string}

const DAILY_CAP = Number(process.env.BUILD_DAILY_CAP ?? 50)

export const handler = documentEventHandler<Event>(async ({context, event}) => {
  const brief = event.data
  const client = createClient({...context.clientOptions, apiVersion: API_VERSION, useCdn: false})
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

    const [content, rulesSyncedAt] = await Promise.all([
      briefContent(brief),
      client.fetch<string | null>(`*[_id == "rulesSyncStatus"][0].lastRefreshAt`),
    ])
    const output = await runBuild({
      brief: content,
      contextToken,
      model: process.env.BUILD_MODEL ?? 'claude-opus-5-5',
    })

    const pageId = `drafts.${randomUUID()}`
    const slug = await uniqueSlug(client, output.page.slug)
    const previewToken = randomBytes(24).toString('base64url')
    const previewUrl = `${process.env.PREVIEW_BASE_URL ?? 'http://localhost:3000'}/preview/${previewToken}`

    await client.create({
      _id: pageId,
      ...toPageDocument({...output.page, slug}),
      brief: {_type: 'reference', _ref: brief._id, _weak: true},
      buildKey,
    })

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
