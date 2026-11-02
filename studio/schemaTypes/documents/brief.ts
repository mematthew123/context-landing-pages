import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const BRIEF_STATUSES = ['idle', 'building', 'done', 'failed'] as const

const buildReport = defineArrayMember({
  name: 'buildReport',
  title: 'Build',
  type: 'object',
  fields: [
    defineField({name: 'startedAt', type: 'datetime'}),
    defineField({name: 'finishedAt', type: 'datetime'}),
    defineField({name: 'pageId', type: 'string'}),
    defineField({name: 'slug', type: 'string'}),
    defineField({name: 'previewToken', type: 'string', hidden: true}),
    defineField({name: 'previewUrl', type: 'url'}),
    defineField({name: 'rulesSyncedAt', type: 'datetime'}),
    defineField({name: 'model', type: 'string'}),
    defineField({
      name: 'appliedRules',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'rule'}], weak: true})],
    }),
    defineField({name: 'dropped', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'imagesPlaced', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'imagesGenerated', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'placeholders', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'gaps', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'error', type: 'text', rows: 2}),
  ],
  preview: {
    select: {startedAt: 'startedAt', slug: 'slug', error: 'error'},
    prepare: ({startedAt, slug, error}) => ({
      title: slug ? `/lp/${slug}` : error ? 'Failed' : 'Building…',
      subtitle: startedAt ? new Date(startedAt).toLocaleString() : undefined,
    }),
  },
})

export const brief = defineType({
  name: 'brief',
  title: 'Brief',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'document',
      title: 'Brief document',
      type: 'file',
      description: 'PDF, DOCX, Markdown, or plain text. Or paste the brief below instead.',
      options: {accept: '.pdf,.docx,.md,.markdown,.txt'},
    }),
    defineField({
      name: 'text',
      title: 'Brief text',
      type: 'text',
      rows: 16,
      // A warning, not an error: Content Agent asks for confirmation before publishing a type with
      // custom errors. The Build enforces it.
      validation: (rule) =>
        rule
          .custom((text, context) => {
            const hasFile = Boolean((context.document?.document as {asset?: unknown})?.asset)
            if (hasFile && text) return 'Use either a document or text, not both'
            if (!hasFile && !text) return 'Upload a document or paste the brief'
            return true
          })
          .warning(),
    }),
    defineField({name: 'submittedBy', type: 'string'}),
    defineField({
      name: 'submittedVia',
      type: 'string',
      options: {list: ['studio', 'slack', 'form'], layout: 'radio', direction: 'horizontal'},
      initialValue: 'studio',
    }),
    defineField({
      name: 'buildRequestedAt',
      type: 'datetime',
      description: 'Set to the current time and publish to request a Build.',
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {list: [...BRIEF_STATUSES]},
      initialValue: 'idle',
      readOnly: true,
    }),
    defineField({
      name: 'builds',
      type: 'array',
      description: 'Every Build of this Brief, newest last. Each one is its own Draft page.',
      of: [buildReport],
      readOnly: true,
    }),
  ],
  preview: {
    select: {title: 'title', status: 'status', via: 'submittedVia', by: 'submittedBy'},
    prepare: ({title, status, via, by}) => ({
      title: title || 'Untitled brief',
      subtitle: [status, via, by].filter(Boolean).join(' · '),
    }),
  },
})
