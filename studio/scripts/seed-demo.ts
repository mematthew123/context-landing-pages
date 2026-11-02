// Seeds the demo from a local folder that is never committed (it holds material derived from Hex's
// Guides): rules.json, front-door-slack.md, brief-data-leaders.md, baseline-data-leaders.json.
//
//   npx sanity exec scripts/seed-demo.ts --with-user-token -- ../.plans/demo
import {randomBytes} from 'node:crypto'
import {existsSync, readFileSync} from 'node:fs'
import {join, resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'
import {toPageDocument} from '../../blueprint/functions/build-page/toSanity'
import type {PageOutput} from '../../blueprint/functions/build-page/pageSchema'

const dir = resolve(process.argv[process.argv.length - 1] ?? '')
const client = getCliClient({apiVersion: '2026-11-01'})
const read = (name: string) => readFileSync(join(dir, name), 'utf8')

async function seedRules() {
  const rules = JSON.parse(read('rules.json')) as {_id: string; examples?: object[]}[]
  const tx = client.transaction()
  for (const rule of rules) {
    const examples = rule.examples?.map((example, i) => ({_key: `e${i}`, _type: 'example', ...example}))
    tx.createOrReplace({...rule, _type: 'rule', examples})
  }
  await tx.commit()
  console.log(`Seeded ${rules.length} Rules`)
}

async function seedSingletons() {
  await client.createIfNotExists({_id: 'rulesSyncStatus', _type: 'rulesSyncStatus', state: 'current'})
  await client.createOrReplace({
    _id: 'frontDoor.slack',
    _type: 'frontDoorScript',
    title: 'Slack (Content Agent)',
    instructions: read('front-door-slack.md'),
  })
  console.log('Seeded the Rules sync status and the Slack Front-door script')
}

async function seedBrief() {
  const text = read('brief-data-leaders.md').replace(/<!--[\s\S]*?-->\s*/, '').trim()
  await client.createIfNotExists({
    _id: 'brief-data-leaders',
    _type: 'brief',
    title: 'Solutions — Dayduh leaders',
    text,
    submittedBy: 'Product marketing',
    submittedVia: 'studio',
    status: 'idle',
  })
  console.log('Seeded the demo Brief (no Build requested)')
}

// Hex's page JSON (the Baseline) is close to the Build's output shape; map what differs
type BaselineBlock = Record<string, unknown> & {_type: string}
function baselineToPage(json: Record<string, any>): PageOutput {
  const blocks = (list: BaselineBlock[]) =>
    list.map((block) => {
      if (block._type === 'pageBuilderQuote') {
        const {customer, ...rest} = block as BaselineBlock & {customer?: string}
        return {...rest, company: customer}
      }
      return block
    })
  return {
    name: `Baseline — ${json.name}`,
    slug: `baseline-${json.slug}`,
    metaTitle: json.metaTitle,
    metaDescription: json.metaDescription,
    hero: json.hero,
    containers: json.containers.map((container: Record<string, any>) => {
      const {image, ...rest} = container
      return {
        ...rest,
        ...(container._type === 'pageBuilderMediaWithSection' ? {placeholderNote: image?.alt ?? 'Image'} : {}),
        ...(container.blocks ? {blocks: blocks(container.blocks)} : {}),
      }
    }),
    faq: json.faq,
  } as PageOutput
}

async function seedBaseline() {
  const file = join(dir, 'baseline-data-leaders.json')
  if (!existsSync(file)) return
  const page = baselineToPage(JSON.parse(readFileSync(file, 'utf8')))
  const pageId = 'drafts.baseline-data-leaders'
  await client.createOrReplace({_id: pageId, ...toPageDocument(page)})

  const existing = await client.fetch<string | null>(`*[_id == "brief-baseline"][0].builds[0].previewToken`)
  const previewToken = existing ?? randomBytes(24).toString('base64url')
  const previewBase = process.env.PREVIEW_BASE_URL ?? 'http://localhost:3000'
  await client.createOrReplace({
    _id: 'brief-baseline',
    _type: 'brief',
    title: 'Baseline — Notion + Cursor',
    text: 'The page Hex’s current workflow produced from the Dayduh leaders brief, kept for comparison.',
    submittedBy: 'Hex (current workflow)',
    submittedVia: 'studio',
    status: 'done',
    builds: [
      {
        _key: 'baseline',
        _type: 'buildReport',
        pageId,
        slug: page.slug,
        previewToken,
        previewUrl: `${previewBase}/preview/${previewToken}`,
        model: 'Notion + Cursor',
      },
    ],
  })
  console.log(`Seeded the Baseline page: ${previewBase}/preview/${previewToken}`)
}

await seedRules()
await seedSingletons()
await seedBrief()
await seedBaseline()
