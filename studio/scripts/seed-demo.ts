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

// Only writes Rules that changed: every published Rule write starts a Rules sync
async function seedRules() {
  const rules = JSON.parse(read('rules.json')) as {_id: string; examples?: object[]}[]
  const existing = new Map(
    (await client.fetch<{_id: string; doc: string}[]>(`*[_type == "rule" && !(_id in path("drafts.**"))]{_id, "doc": @}`)).map(
      (rule) => [rule._id, JSON.stringify(rule.doc)],
    ),
  )
  const tx = client.transaction()
  let changed = 0
  for (const rule of rules) {
    const examples = rule.examples?.map((example, i) => ({_key: `e${i}`, _type: 'example', ...example}))
    const doc = {...rule, _type: 'rule', examples}
    const current = existing.get(rule._id)
    if (current && sameFields(JSON.parse(current), doc)) continue
    tx.createOrReplace(doc)
    changed++
  }
  if (changed) await tx.commit()
  console.log(`Seeded ${changed} new or changed Rules (${rules.length} total)`)
}

function sameFields(current: Record<string, unknown>, next: Record<string, unknown>) {
  return Object.keys(next).every((field) => JSON.stringify(current[field]) === JSON.stringify(next[field]))
}

// The Baseline's product screenshots, copied from Hex's public CDN into the Image library
const LIBRARY: {file: string; title: string; description: string; kind: string; products: string[]}[] = [
  {
    file: '00ea9d4abd4463a6f1ee01549873bbe36482e0c4-1680x1020.png',
    title: 'Team collaborating in a notebook',
    description: 'A data team collaborating on an analysis together in a Hex notebook.',
    kind: 'product-ui',
    products: ['Notebooks'],
  },
  {
    file: '00af13a70a52f86cc9cf2cb2db0d3cdd97593c50-1800x945.png',
    title: 'AI writing a query from a prompt',
    description: 'AI in a Hex notebook turning a natural-language question into a SQL query.',
    kind: 'product-ui',
    products: ['Notebooks', 'AI'],
  },
  {
    file: '00d65e028b196539af7e965e9a8179081fe2d5aa-1800x945.png',
    title: 'Governed, reusable workspace components',
    description: 'Endorsed, reusable data components in a Hex workspace that teams can build on.',
    kind: 'product-ui',
    products: ['Context Studio'],
  },
  {
    file: 'c9f977682aad348168f6ddc954b5e326d4209019-1980x1092.png',
    title: 'Evals run in Context Studio',
    description: 'An Evals run in Context Studio listing passed and failed prompts with their rubrics.',
    kind: 'product-ui',
    products: ['Context Studio', 'Evals'],
  },
  {
    file: '11dd29343e749fb05ba4f8998c328c69dfa1479f-712x463.svg',
    title: 'Questions flowing through governed context',
    description: 'Diagram of questions from Slack and AI tools flowing through governed context layers in Hex.',
    kind: 'illustration',
    products: ['Context Studio', 'Threads'],
  },
]

async function seedLibrary() {
  for (const entry of LIBRARY) {
    const _id = `libraryImage.${entry.file.slice(0, 12)}`
    if (await client.fetch<boolean>(`defined(*[_id == $id][0]._id)`, {id: _id})) continue
    const res = await fetch(`https://cdn.sanity.io/images/e92memrj/production/${entry.file}`)
    if (!res.ok) throw new Error(`Could not download ${entry.file} (${res.status})`)
    const asset = await client.assets.upload('image', Buffer.from(await res.arrayBuffer()), {filename: entry.file})
    const {file: _, ...fields} = entry
    await client.createOrReplace({
      _id,
      _type: 'libraryImage',
      ...fields,
      image: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}, alt: entry.description},
    })
  }
  console.log(`Seeded the Image library (${LIBRARY.length} images)`)
}

const FRONT_DOORS = [
  {file: 'front-door-slack.md', _id: 'frontDoor.slack', title: 'Slack (Content Agent)'},
  {file: 'front-door-claude.md', _id: 'frontDoor.claude', title: 'Claude (Sanity connector)'},
]

async function seedSingletons() {
  await client.createIfNotExists({_id: 'rulesSyncStatus', _type: 'rulesSyncStatus', state: 'current'})
  for (const door of FRONT_DOORS) {
    if (!existsSync(join(dir, door.file))) continue
    await client.createOrReplace({_id: door._id, _type: 'frontDoorScript', title: door.title, instructions: read(door.file)})
  }
  console.log('Seeded the Rules sync status and the Front-door scripts')
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
  await client.createOrReplace({_id: pageId, ...toPageDocument(page).document})

  const existing = await client.fetch<string | null>(`*[_id == "brief-baseline"][0].builds[0].previewToken`)
  const previewToken = existing ?? randomBytes(24).toString('base64url')
  const previewBase = process.env.PREVIEW_BASE_URL ?? 'https://web-phi-three-79.vercel.app'
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
await seedLibrary()
await seedSingletons()
await seedBrief()
await seedBaseline()
