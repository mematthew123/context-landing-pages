import {defineField, defineType} from 'sanity'
import {CommentIcon} from '@sanity/icons/Comment'

export const pageBuilderQuote = defineType({
  name: 'pageBuilderQuote',
  title: 'Quote',
  type: 'object',
  icon: CommentIcon,
  fields: [
    defineField({name: 'quote', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({
      name: 'highlightedText',
      type: 'string',
      description: 'Emphasized. An exact phrase from the quote.',
      validation: (rule) =>
        rule.custom((value, context) => {
          const quote = (context.parent as {quote?: string} | undefined)?.quote
          return !value || !quote || quote.includes(value)
            ? true
            : 'Enter a phrase that appears exactly in the quote'
        }),
    }),
    defineField({
      name: 'author',
      type: 'string',
      description: 'Name of the person being quoted, or the company when no person is approved.',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'authorTitle', type: 'string', description: 'Job title and company.'}),
    defineField({name: 'company', type: 'string', description: 'Customer company name.'}),
  ],
  preview: {
    select: {title: 'author', subtitle: 'authorTitle'},
    prepare: ({title, subtitle}) => ({
      title: title || 'Untitled quote',
      subtitle: subtitle || 'Quote',
      media: CommentIcon,
    }),
  },
})
