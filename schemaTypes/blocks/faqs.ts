import {defineArrayMember, defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'

export const faqs = defineType({
  name: 'faqs',
  title: 'FAQs',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
    }),
    defineField({
      name: 'items',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'faq',
          title: 'FAQ',
          type: 'object',
          icon: HelpCircleIcon,
          fields: [
            defineField({
              name: 'question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              type: 'text',
              rows: 4,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {title: 'question', subtitle: 'answer'},
          },
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
        subtitle: `FAQs · ${count} question${count === 1 ? '' : 's'}`,
        media: HelpCircleIcon,
      }
    },
  },
})
