import Anthropic from '@anthropic-ai/sdk'
import {z} from 'zod/v4'
import {MCP_URL} from '../../lib/config'
import {BuildOutputSchema, checkLimits, type BuildOutput} from './pageSchema'

// The only prompt in the repo. Mechanics only: every editorial decision lives in the Knowledge Base
// as Rules (ADR 0003). tests/harness.test.ts fails if editorial vocabulary creeps in.
export const HARNESS_PROMPT = `You build one Draft landing page from the Brief you are given. Submit it with the submit_build tool; its input schema is the contract.

How to work:
1. The Knowledge Base outline is below. Before writing any part of the page, use knowledge_base_search and knowledge_base_read to retrieve the Rules for that part: the hero, each container and block type you use, the FAQ, the metadata, and the slug. Read the entries themselves, not only the outline.
2. Follow the retrieved Rules for every editorial decision. Record each Rule you applied in report.appliedRules: its id when the entry cites one (ids start with "rule."), its statement, and where you applied it.
3. When no Rule covers a decision, make it and record it in report.gaps.
4. For every media slot, describe what belongs there in placeholderNote, then fill it only as the Rules allow: set libraryImage to the _id of an entry in the Image library you are given, or set imagePrompt to have an image generated, or leave it out. List every slot you leave out in report.placeholders.
5. List anything from the Brief that is not on the page in report.dropped, with the reason.

Knowledge Base outline:
`

const MCP_SERVER = 'page-rules'
const SUBMIT_TOOL = 'submit_build'
const MAX_TURNS = 8
const MAX_REPAIRS = 2

// The output contract as a plain (non-strict) tool: a strict structured-output grammar for the
// nested block unions is too large to compile, so Zod and checkLimits validate instead
const {$schema: _, ...inputSchema} = z.toJSONSchema(BuildOutputSchema) as Record<string, unknown>
const submitTool: Anthropic.Beta.BetaTool = {
  name: SUBMIT_TOOL,
  description: 'Submit the finished Draft page and the report. Call it exactly once, when the page is complete.',
  input_schema: inputSchema as Anthropic.Beta.BetaTool.InputSchema,
}

export type BriefContent = Anthropic.Beta.BetaContentBlockParam

export async function fetchInitialContext(token: string): Promise<string> {
  const res = await fetch(`${MCP_URL}/initial-context`, {headers: {Authorization: `Bearer ${token}`}})
  if (!res.ok) throw new Error(`Context initial-context returned ${res.status}`)
  return res.text()
}

export type LibraryEntry = {_id: string; title: string; description: string; kind: string; products?: string[]}

export async function runBuild({
  brief,
  library,
  contextToken,
  model,
}: {
  brief: BriefContent
  library: LibraryEntry[]
  contextToken: string
  model: string
}): Promise<BuildOutput> {
  const client = new Anthropic()
  const system = HARNESS_PROMPT + (await fetchInitialContext(contextToken))
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    {
      role: 'user',
      content: [
        brief,
        {type: 'text', text: `Image library (JSON):\n${JSON.stringify(library, null, 1)}`},
        {type: 'text', text: `Build the Draft page from this Brief, then call ${SUBMIT_TOOL}.`},
      ],
    },
  ]
  let repairs = 0

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    // Streamed: the SDK refuses non-streaming calls that may run past 10 minutes
    const message = await client.beta.messages
      .stream({
        model,
        max_tokens: 32000,
        betas: ['mcp-client-2025-11-20', 'server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: {effort: 'medium'},
        system,
        mcp_servers: [{type: 'url', url: MCP_URL, name: MCP_SERVER, authorization_token: contextToken}],
        tools: [
          // The outline is already in the system prompt
          {type: 'mcp_toolset', mcp_server_name: MCP_SERVER, configs: {initial_context: {enabled: false}}},
          submitTool,
        ],
        messages,
      })
      .finalMessage()

    if (message.stop_reason === 'refusal') throw new Error('The model declined to build this Brief')
    messages.push({role: 'assistant', content: message.content})
    if (message.stop_reason === 'pause_turn') continue

    const submit = message.content.find(
      (block): block is Anthropic.Beta.BetaToolUseBlock => block.type === 'tool_use' && block.name === SUBMIT_TOOL,
    )
    if (!submit) {
      messages.push({role: 'user', content: `Call ${SUBMIT_TOOL} with the finished page and report.`})
      continue
    }

    const parsed = BuildOutputSchema.safeParse(submit.input)
    const errors = parsed.success
      ? checkLimits(parsed.data.page)
      : parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    if (parsed.success && errors.length === 0) return parsed.data
    if (repairs++ >= MAX_REPAIRS) throw new Error(`The page broke the schema: ${errors.slice(0, 10).join('; ')}`)

    messages.push({
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: submit.id,
          is_error: true,
          content: `Fix these problems and call ${SUBMIT_TOOL} again with the whole output:\n- ${errors.join('\n- ')}`,
        },
      ],
    })
  }
  throw new Error(`No valid page after ${MAX_TURNS} turns`)
}
