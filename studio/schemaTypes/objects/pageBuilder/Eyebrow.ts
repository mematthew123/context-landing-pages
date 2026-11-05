import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'

export const pageBuilderEyebrow = defineType({
  name: 'pageBuilderEyebrow',
  title: 'Eyebrow',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'text',
      type: 'string',
      description: 'Short mono uppercase label shown above a heading.',
      validation: (rule) => rule.required().max(40).error('An eyebrow is at most 40 characters'),
    }),
  ],
  preview: {
    select: {title: 'text'},
    prepare: ({title}) => ({title: title || 'Untitled eyebrow', subtitle: 'Eyebrow', media: TagIcon}),
  },
})
