import {defineField, defineType} from 'sanity'
import {SearchIcon} from '@sanity/icons/Search'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Defaults to the page title',
      validation: (rule) => rule.max(60).warning('Keep it under 60 characters'),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160).warning('Keep it under 160 characters'),
    }),
    defineField({
      name: 'image',
      title: 'Social sharing image',
      type: 'image',
    }),
  ],
})
