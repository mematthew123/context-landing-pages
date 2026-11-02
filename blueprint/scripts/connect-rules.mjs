// One-time: attach the published Rules to the Knowledge Base as its dataset source, build it, and
// turn on weekly refresh. Run after `pnpm run deploy`, signed in with a personal login (deploy
// tokens can't attach dataset sources). Runs from this folder, which has no sanity.cli.ts.
import {execFileSync} from 'node:child_process'

const ORG = 'otj10m0k9'
const PROJECT = '3y29l7xh'
const DATASET = 'production'
const QUERY =
  '*[_type == "rule"]{_id, statement, category, appliesTo, rationale, examples[]{do, dont}, "guide": source.guide}'

const sanity = (...args) =>
  execFileSync('npx', ['-y', 'sanity@latest', 'context', ...args], {encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit']})

const list = JSON.parse(sanity('list', '--organization', ORG, '--json'))
const kb = (list.data ?? list).find((item) => item.title === 'Hex page rules')
if (!kb) throw new Error('Deploy the Blueprint first: no "Hex page rules" Knowledge Base found')
console.log(`Knowledge Base ${kb.id}`)

const imports = JSON.parse(sanity('imports', 'list', kb.id, '--json'))
const hasRules = (imports.data ?? imports).some((item) => item.datasetSource?.query === QUERY)
if (hasRules) {
  console.log('Rules are already a source')
} else {
  console.log(sanity('imports', 'create', kb.id, '--sanity-project', PROJECT, '--sanity-dataset', DATASET, '--query', QUERY))
}

console.log(sanity('build', kb.id, '--watch'))
console.log(sanity('update', kb.id, '--refresh-enabled', '--refresh-frequency', 'weekly'))
console.log(`\nSet KNOWLEDGE_BASE_ID=${kb.id} on the sync-rules function to skip the lookup.`)
