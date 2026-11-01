import {defineArrayMember, defineField, defineType} from 'sanity'
import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'

export const pageBuilderChecklist = defineType({
  name: 'pageBuilderChecklist',
  title: 'Checklist',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'items',
      type: 'array',
      description: 'One to eight short lines, each shown with a check mark.',
      of: [
        defineArrayMember({
          type: 'string',
          validation: (rule) =>
            rule.required().max(120).error('A checklist item is at most 120 characters'),
        }),
      ],
      validation: (rule) =>
        rule.required().min(1).max(8).error('A checklist holds one to eight items'),
    }),
  ],
  preview: {
    select: {items: 'items'},
    prepare: ({items}) => {
      const count = items?.length ?? 0
      return {
        title: items?.[0] || 'Untitled checklist',
        subtitle: `Checklist · ${count} item${count === 1 ? '' : 's'}`,
        media: CheckmarkCircleIcon,
      }
    },
  },
})
