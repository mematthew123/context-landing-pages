import {createClient} from '@sanity/client'
import {CONTEXT_API_VERSION, ORGANIZATION_ID} from './config'

// Org-level client for the Context API. Needs an org token: project tokens get 403 contextGrantRequired.
export function contextClient(knowledgeBaseId?: string) {
  const token = process.env.SANITY_CONTEXT_TOKEN
  if (!token) throw new Error('SANITY_CONTEXT_TOKEN is not set')
  return createClient({
    apiVersion: CONTEXT_API_VERSION,
    useProjectHostname: false,
    useCdn: false,
    token,
    context: {organizationId: ORGANIZATION_ID},
    ...(knowledgeBaseId ? {resource: {type: 'knowledge-base', id: knowledgeBaseId}} : {}),
  })
}

// A Knowledge Base has two ids: `id` (a UUID) for the management API, and `publicId` (`kb…`), which
// its entry documents carry in `knowledgeBaseId`
export type KnowledgeBaseIds = {id: string; publicId?: string}

export async function findKnowledgeBase(): Promise<KnowledgeBaseIds> {
  const client = contextClient()
  const kb = process.env.KNOWLEDGE_BASE_ID
    ? await client.context.knowledgeBases.get(process.env.KNOWLEDGE_BASE_ID)
    : (await client.context.knowledgeBases.list({organizationId: ORGANIZATION_ID})).data.find(
        (kb) => kb.title === 'Hex page rules',
      )
  if (!kb) throw new Error('No "Hex page rules" Knowledge Base in the organization')
  return {id: kb.id, publicId: (kb as {publicId?: string}).publicId}
}

const TERMINAL = new Set(['succeeded', 'done', 'failed', 'cancelled'])

export async function waitForJob(client: ReturnType<typeof contextClient>, jobId: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const job = (await client.context.jobs.get({jobId})) as {status?: string; error?: unknown}
    if (job.status && TERMINAL.has(job.status)) return job
    if (Date.now() > deadline) throw new Error(`Context job ${jobId} still ${job.status} after ${timeoutMs / 1000}s`)
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
}
