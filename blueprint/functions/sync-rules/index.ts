import {createClient} from '@sanity/client'
import {documentEventHandler} from '@sanity/functions'
import {API_VERSION} from '../../lib/config'
import {contextClient, findKnowledgeBaseId, waitForJob} from '../../lib/context'

const STATUS_ID = 'rulesSyncStatus'

// Rules sync: after a Rule is published, refresh the Knowledge Base and apply routine updates.
// Conflicts stay open for a person to settle in the Context app, usually with an Override.
export const handler = documentEventHandler(async ({context}) => {
  const client = createClient({...context.clientOptions, apiVersion: API_VERSION, useCdn: false})
  await client.createIfNotExists({_id: STATUS_ID, _type: STATUS_ID})

  const status = await client.fetch<{state?: string} | null>(`*[_id == $id][0]{state}`, {id: STATUS_ID})
  if (status?.state === 'syncing') {
    // The running sync re-checks once it finishes
    await client.patch(STATUS_ID).set({pending: true}).commit()
    return
  }
  await client.patch(STATUS_ID).set({state: 'syncing', pending: false}).unset(['error']).commit()

  try {
    const kb = contextClient(await findKnowledgeBaseId())
    let updatesApplied = 0
    let openConflicts = 0

    for (let pass = 0; pass < 3; pass++) {
      const refresh = await kb.context.refresh()
      if (refresh.jobId) await waitForJob(kb, refresh.jobId, 240_000)

      const open = await kb.context.issues.list({status: 'open'})
      const updates = open.filter((issue) => issue.content?.kind === 'update_required' && issue.content.scopePath !== '*')
      openConflicts = open.filter((issue) => issue.content?.kind === 'conflict').length

      if (updates.length) {
        const applied = await kb.context.issues.apply({issueIds: updates.map((issue) => issue._id)})
        if (applied.jobId) await waitForJob(kb, applied.jobId, 240_000)
        updatesApplied += updates.length
      }

      // Another Rule was published while this one synced: go round again
      const again = await client.fetch<boolean>(`*[_id == $id][0].pending == true`, {id: STATUS_ID})
      if (!again) break
      await client.patch(STATUS_ID).set({pending: false}).commit()
    }

    await client
      .patch(STATUS_ID)
      .set({
        state: openConflicts ? 'review' : 'current',
        lastRefreshAt: new Date().toISOString(),
        updatesApplied,
        openConflicts,
      })
      .commit()
  } catch (error) {
    console.error('Rules sync failed:', error)
    await client
      .patch(STATUS_ID)
      .set({state: 'failed', error: error instanceof Error ? error.message : String(error)})
      .commit()
  }
})
