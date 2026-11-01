import {defineArrayMember, defineField, defineType} from 'sanity'
import {ThListIcon} from '@sanity/icons/ThList'
import {SparklesIcon} from '@sanity/icons/Sparkles'

export const features = defineType({
  name: 'features',
  type: 'object',
  icon: ThListIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
    }),
    defineField({
      name: 'intro',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'items',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'feature',
          type: 'object',
          icon: SparklesIcon,
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'text',
              type: 'text',
              rows: 3,
            }),
          ],
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: {title: 'heading', items: 'items'},
    prepare({title, items}) {
      const count = Array.isArray(items) ? items.length : 0
      return {
        title: title || 'Untitled',
        subtitle: `Features · ${count} item${count === 1 ? '' : 's'}`,
        media: ThListIcon,
      }
    },
  },
})
