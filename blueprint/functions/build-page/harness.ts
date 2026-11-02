import Anthropic from '@anthropic-ai/sdk'
import {betaZodOutputFormat} from '@anthropic-ai/sdk/helpers/beta/zod'
import {MCP_URL} from '../../lib/config'
import {BuildOutputSchema, checkLimits, type BuildOutput} from './pageSchema'

// The only prompt in the repo. Mechanics only: every editorial decision lives in the Knowledge Base
// as Rules (ADR 0003). tests/harness.test.ts fails if editorial vocabulary creeps in.
export const HARNESS_PROMPT = `You build one Draft landing page from the Brief you are given. Your output must match the JSON schema.

How to work:
1. The Knowledge Base outline is below. Before writing any part of the page, use knowledge_base_search and knowledge_base_read to retrieve the Rules for that part: the hero, each container and block type you use, the FAQ, the metadata, and the slug. Read the entries themselves, not only the outline.
2. Follow the retrieved Rules for every editorial decision. Record each Rule you applied in report.appliedRules: its id when the entry cites one (ids start with "rule."), its statement, and where you applied it.
3. When no Rule covers a decision, make it and record it in report.gaps.
4. Never create or reference images. Leave every media slot empty, describe what belongs there in placeholderNote, and list it in report.placeholders.
5. List anything from the Brief that is not on the page in report.dropped, with the reason.

Knowledge Base outline:
`

const MCP_SERVER = 'page-rules'
const MAX_CONTINUATIONS = 4

export type BriefContent = Anthropic.Beta.BetaContentBlockParam

export async function fetchInitialContext(token: string): Promise<string> {
  const res = await fetch(`${MCP_URL}/initial-context`, {headers: {Authorization: `Bearer ${token}`}})
  if (!res.ok) throw new Error(`Context initial-context returned ${res.status}`)
  return res.text()
}

export async function runBuild({
  brief,
  contextToken,
  model,
}: {
  brief: BriefContent
  contextToken: string
  model: string
}): Promise<BuildOutput> {
  const client = new Anthropic()
  const system = HARNESS_PROMPT + (await fetchInitialContext(contextToken))
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {role: 'user', content: [brief, {type: 'text', text: 'Build the Draft page from this Brief.'}]},
  ]

  for (let repair = 0; repair <= 1; repair++) {
    let message: Awaited<ReturnType<typeof client.beta.messages.parse>> | undefined
    for (let attempt = 0; attempt <= MAX_CONTINUATIONS; attempt++) {
      message = await client.beta.messages.parse({
        model,
        max_tokens: 32000,
        betas: ['mcp-client-2025-11-20', 'server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: {effort: 'medium', format: betaZodOutputFormat(BuildOutputSchema)},
        system,
        mcp_servers: [{type: 'url', url: MCP_URL, name: MCP_SERVER, authorization_token: contextToken}],
        // The outline is already in the system prompt
        tools: [{type: 'mcp_toolset', mcp_server_name: MCP_SERVER, configs: {initial_context: {enabled: false}}}],
        messages,
      })
      if (message.stop_reason !== 'pause_turn') break
      messages.push({role: 'assistant', content: message.content})
    }

    if (!message) throw new Error('No response from the model')
    if (message.stop_reason === 'refusal') throw new Error('The model declined to build this Brief')
    if (message.stop_reason === 'pause_turn') throw new Error('Reading the Knowledge Base took too long')
    const output = message.parsed_output as BuildOutput | null
    if (!output) throw new Error(`The model returned no page (stop reason: ${message.stop_reason})`)

    const errors = checkLimits(output.page)
    if (errors.length === 0) return output
    if (repair === 1) throw new Error(`The page broke schema limits: ${errors.join('; ')}`)

    messages.push(
      {role: 'assistant', content: message.content},
      {role: 'user', content: `Fix these schema problems and return the whole output again:\n- ${errors.join('\n- ')}`},
    )
  }
  throw new Error('unreachable')
}
