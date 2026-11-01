import {defineField, defineType} from 'sanity'
import {LaunchIcon} from '@sanity/icons/Launch'

export const callToAction = defineType({
  name: 'callToAction',
  title: 'Call to action',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'text',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'link',
      type: 'link',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {
        title: title || 'Untitled',
        subtitle: 'Call to action',
        media: LaunchIcon,
      }
    },
  },
})
