import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

export const link = defineType({
  name: 'link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      description: 'A full URL, or a path on this site like /pricing',
      validation: (rule) =>
        rule.required().uri({scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true}),
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'href'},
  },
})
