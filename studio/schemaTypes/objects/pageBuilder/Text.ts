import {defineField, defineType} from 'sanity'
import {TextIcon} from '@sanity/icons/Text'
import {portableTextPreview} from './portableTextPreview'

export const pageBuilderText = defineType({
  name: 'pageBuilderText',
  title: 'Text',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({name: 'body', type: 'simpleBlockContent', validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {body: 'body'},
    prepare: ({body}) => ({
      title: portableTextPreview(body) || 'Empty text',
      subtitle: 'Text',
      media: TextIcon,
    }),
  },
})
