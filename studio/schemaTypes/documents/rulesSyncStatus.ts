import {defineArrayMember, defineField, defineType} from 'sanity'
import {SyncIcon} from '@sanity/icons/Sync'

export const rulesSyncStatus = defineType({
  name: 'rulesSyncStatus',
  title: 'Rules sync status',
  type: 'document',
  icon: SyncIcon,
  readOnly: true,
  fields: [
    defineField({
      name: 'state',
      type: 'string',
      options: {list: ['current', 'syncing', 'review', 'failed']},
    }),
    defineField({name: 'lastRefreshAt', type: 'datetime'}),
    defineField({name: 'updatesApplied', type: 'number'}),
    defineField({name: 'openConflicts', type: 'number'}),
    defineField({name: 'pendingRuleIds', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'error', type: 'text', rows: 2}),
  ],
  preview: {
    select: {state: 'state', at: 'lastRefreshAt', conflicts: 'openConflicts'},
    prepare: ({state, at, conflicts}) => ({
      title: `Rules: ${state ?? 'never synced'}`,
      subtitle: [at && new Date(at).toLocaleString(), conflicts ? `${conflicts} conflicts` : null]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
