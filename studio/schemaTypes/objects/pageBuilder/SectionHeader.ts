import {defineArrayMember, defineField, defineType} from 'sanity'
import {TextIcon} from '@sanity/icons/Text'
import {matchedTextField} from './validateMatchedTextSuffix'

export const pageBuilderSectionHeader = defineType({
  name: 'pageBuilderSectionHeader',
  title: 'Section Header',
  type: 'object',
  icon: TextIcon,
  description:
    'Centered h2 intro. Headings in the containers that follow, up to the next Section Header, render one level lower.',
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'string',
      validation: (rule) => rule.max(40).error('An eyebrow is at most 40 characters'),
    }),
    defineField({name: 'heading', type: 'string', validation: (rule) => rule.required()}),
    matchedTextField('heading'),
    defineField({name: 'subheading', type: 'text', rows: 3}),
    defineField({
      name: 'ctas',
      title: 'CTAs',
      type: 'array',
      description: 'Up to two. The first renders loud.',
      of: [defineArrayMember({type: 'pageBuilderCta'})],
      validation: (rule) => rule.max(2).error('A section header holds at most two CTAs'),
    }),
  ],
  preview: {
    select: {title: 'heading', eyebrow: 'eyebrow'},
    prepare: ({title, eyebrow}) => ({
      title: title || 'Untitled section header',
      subtitle: eyebrow ? `Section Header · ${eyebrow}` : 'Section Header',
      media: TextIcon,
    }),
  },
})
