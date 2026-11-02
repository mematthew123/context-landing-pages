import {createClient} from '@sanity/client'
import {documentEventHandler} from '@sanity/functions'
import {API_VERSION} from '../../lib/config'
import {contextClient, findKnowledgeBase, waitForJob, type KnowledgeBaseIds} from '../../lib/context'

const STATUS_ID = 'rulesSyncStatus'
const JOB_TIMEOUT = 240_000

type RuleEvent = {_id: string; operation?: 'create' | 'update' | 'delete'}
type KB = ReturnType<typeof contextClient>

// Rules sync: bring the Knowledge Base in line with the published Rules after one changes.
// A refresh re-ingests the Rules but files no issue for an edited one, so after it the entries whose
// citations name the Rule are rebuilt. A new Rule has no entry yet: fall back to a full build.
// Conflicts stay open for a person to settle in the Context app, usually with an Override.
export const handler = documentEventHandler<RuleEvent>(async ({context, event}) => {
  const client = createClient({...context.clientOptions, apiVersion: API_VERSION, useCdn: false})
  const ruleId = event.data._id.replace(/^drafts\./, '')
  await client.createIfNotExists({_id: STATUS_ID, _type: STATUS_ID})

  const status = await client.fetch<{state?: string} | null>(`*[_id == $id][0]{state}`, {id: STATUS_ID})
  if (status?.state === 'syncing') {
    // The running sync drains the queue before it finishes
    await client.patch(STATUS_ID).setIfMissing({pendingRuleIds: []}).append('pendingRuleIds', [ruleId]).commit({autoGenerateArrayKeys: true})
    return
  }
  await client.patch(STATUS_ID).set({state: 'syncing'}).unset(['error']).commit()

  try {
    const ids = await findKnowledgeBase()
    const kb = contextClient(ids.id)
    let queue: {ruleId: string; operation?: string}[] = [{ruleId, operation: event.data.operation}]
    let updatesApplied = 0

    while (queue.length) {
      for (const item of queue) updatesApplied += await syncRule(kb, ids, item.ruleId, item.operation)
      const pending = await client.fetch<string[] | null>(`*[_id == $id][0].pendingRuleIds`, {id: STATUS_ID})
      await client.patch(STATUS_ID).set({pendingRuleIds: []}).commit()
      queue = [...new Set(pending ?? [])].map((id) => ({ruleId: id}))
    }

    const openConflicts = (await kb.context.issues.list({status: 'open'})).filter(
      (issue) => issue.content?.kind === 'conflict',
    ).length
    await client
      .patch(STATUS_ID)
      .set({state: openConflicts ? 'review' : 'current', lastRefreshAt: new Date().toISOString(), updatesApplied, openConflicts})
      .commit()
  } catch (error) {
    console.error('Rules sync failed:', error)
    await client
      .patch(STATUS_ID)
      .set({state: 'failed', error: error instanceof Error ? error.message : String(error)})
      .commit()
  }
})

// Returns how many entries or issues were brought up to date
async function syncRule(kb: KB, ids: KnowledgeBaseIds, ruleId: string, operation?: string): Promise<number> {
  // The refresh re-ingests the Rules; a rebuild only rewrites an entry from the last ingest
  const applied = await refreshAndApply(kb)
  const citing = await entriesCiting(kb, ids, ruleId)
  if (citing.length) {
    console.log(`Rebuilding ${citing.join(', ')} for ${ruleId}`)
    const jobs = await Promise.all(citing.map((path) => kb.context.entries.rebuild({path})))
    await Promise.all(jobs.map((job) => (job.jobId ? waitForJob(kb, job.jobId, JOB_TIMEOUT) : null)))
    return applied + citing.length
  }
  if (applied || operation === 'delete') return applied

  console.log(`No entry cites ${ruleId}; running a full build`)
  const build = await kb.context.build()
  if (build.jobId) await waitForJob(kb, build.jobId, 540_000)
  return 1
}

async function entriesCiting(kb: KB, ids: KnowledgeBaseIds, ruleId: string): Promise<string[]> {
  return kb.context.fetch<string[]>(
    `*[_type == "sanity.context.entry" && knowledgeBaseId in $kbIds && $ruleId in citations[].title].path`,
    {kbIds: [ids.id, ids.publicId].filter(Boolean), ruleId},
  )
}

async function refreshAndApply(kb: KB): Promise<number> {
  const refresh = await kb.context.refresh()
  if (refresh.jobId) await waitForJob(kb, refresh.jobId, JOB_TIMEOUT)
  const updates = (await kb.context.issues.list({status: 'open'})).filter(
    (issue) => issue.content?.kind === 'update_required' && issue.content.scopePath !== '*',
  )
  if (!updates.length) return 0
  const applied = await kb.context.issues.apply({issueIds: updates.map((issue) => issue._id)})
  if (applied.jobId) await waitForJob(kb, applied.jobId, JOB_TIMEOUT)
  return updates.length
}
