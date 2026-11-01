import {defineArrayMember, defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'

export const pageBuilderFaqItem = defineType({
  name: 'pageBuilderFaqItem',
  title: 'FAQ Entry',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'description',
      type: 'simpleBlockContent',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {select: {title: 'title'}},
})

export const pageBuilderFaq = defineType({
  name: 'pageBuilderFaq',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  description: 'Accordion, always rendered last on the page.',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      description: 'Defaults to "FAQ" when empty.',
    }),
    defineField({
      name: 'items',
      title: 'Entries',
      type: 'array',
      of: [defineArrayMember({type: 'pageBuilderFaqItem'})],
      validation: (rule) => rule.required().min(1).error('Add at least one FAQ entry'),
    }),
  ],
  preview: {
    select: {items: 'items', heading: 'heading'},
    prepare: ({items, heading}) => {
      const count = items?.length ?? 0
      return {
        title: heading || 'FAQ',
        subtitle: `${count} entr${count === 1 ? 'y' : 'ies'}`,
        media: HelpCircleIcon,
      }
    },
  },
})
