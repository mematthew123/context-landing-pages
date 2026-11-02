import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'
import {mediaFields} from './mediaFields'

export const pageBuilderImage = defineType({
  name: 'pageBuilderImage',
  title: 'Image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      description: 'Left empty, this renders as a placeholder until someone adds an image.',
      options: {hotspot: true},
      fields: mediaFields,
      validation: (rule) => rule.required().warning('Placeholder: add an image before publishing'),
    }),
    defineField({
      name: 'placeholderNote',
      type: 'string',
      description: 'What image belongs here, for whoever fills the placeholder.',
    }),
  ],
  preview: {
    select: {title: 'image.alt', note: 'placeholderNote', media: 'image'},
    prepare: ({title, note, media}) => ({
      title: title || note || 'Image',
      subtitle: media ? 'Image' : 'Placeholder',
      media: media || ImageIcon,
    }),
  },
})
