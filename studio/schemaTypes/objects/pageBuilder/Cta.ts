import {defineField, defineType} from 'sanity'
import {LaunchIcon} from '@sanity/icons/Launch'

export const pageBuilderCta = defineType({
  name: 'pageBuilderCta',
  title: 'CTA',
  type: 'object',
  icon: LaunchIcon,
  description: 'A button. Emphasis comes from position: the first CTA in a group renders loud.',
  fields: [
    defineField({name: 'text', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'url',
      description: 'A full URL, or a path on hex.tech like /request-a-demo/',
      validation: (rule) =>
        rule.required().uri({allowRelative: true, scheme: ['http', 'https', 'mailto']}),
    }),
  ],
  preview: {
    select: {title: 'text', subtitle: 'href'},
    prepare: ({title, subtitle}) => ({
      title: title || 'Untitled CTA',
      subtitle: subtitle || 'CTA',
      media: LaunchIcon,
    }),
  },
})
