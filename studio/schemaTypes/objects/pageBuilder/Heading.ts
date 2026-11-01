import {defineField, defineType} from 'sanity'
import {BlockElementIcon} from '@sanity/icons/BlockElement'
import {matchedTextField} from './validateMatchedTextSuffix'

export const pageBuilderHeading = defineType({
  name: 'pageBuilderHeading',
  title: 'Heading',
  type: 'object',
  icon: BlockElementIcon,
  description: 'Renders h2, or h3 when the container sits under a Section Header.',
  fields: [
    defineField({name: 'text', type: 'string', validation: (rule) => rule.required()}),
    matchedTextField('text'),
  ],
  preview: {
    select: {title: 'text'},
    prepare: ({title}) => ({
      title: title || 'Untitled heading',
      subtitle: 'Heading',
      media: BlockElementIcon,
    }),
  },
})
