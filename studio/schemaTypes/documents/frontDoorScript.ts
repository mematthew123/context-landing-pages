import {defineField, defineType} from 'sanity'
import {CommentIcon} from '@sanity/icons/Comment'

export const frontDoorScript = defineType({
  name: 'frontDoorScript',
  title: 'Front-door script',
  type: 'document',
  icon: CommentIcon,
  description: 'How a conversational front door creates Briefs. Holds no page-building judgment.',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'instructions', type: 'text', rows: 30}),
  ],
})
