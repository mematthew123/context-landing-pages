import {defineField, defineType} from 'sanity'
import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'
import {portableTextPreview} from './portableTextPreview'

export const pageBuilderCallout = defineType({
  name: 'pageBuilderCallout',
  title: 'Callout',
  type: 'object',
  icon: BulbOutlineIcon,
  description: 'Hairline card with a title, body, and optional image.',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'body', type: 'simpleBlockContent'}),
    defineField({name: 'image', type: 'pageBuilderImage'}),
  ],
  preview: {
    select: {title: 'title', body: 'body'},
    prepare: ({title, body}) => ({
      title: title || 'Untitled callout',
      subtitle: portableTextPreview(body) || 'Callout',
      media: BulbOutlineIcon,
    }),
  },
})
