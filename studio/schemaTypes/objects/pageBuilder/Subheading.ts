import {defineField, defineType} from 'sanity'
import {TextIcon} from '@sanity/icons/Text'

export const pageBuilderSubheading = defineType({
  name: 'pageBuilderSubheading',
  title: 'Subheading',
  type: 'object',
  icon: TextIcon,
  description: 'Large supporting paragraph. Inside a Content Grid cell it becomes the cell title.',
  fields: [
    defineField({name: 'text', type: 'text', rows: 2, validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {title: 'text'},
    prepare: ({title}) => ({
      title: title || 'Untitled subheading',
      subtitle: 'Subheading',
      media: TextIcon,
    }),
  },
})
