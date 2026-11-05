import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons/Images'

export const IMAGE_KINDS = [
  {title: 'Product UI', value: 'product-ui'},
  {title: 'Illustration', value: 'illustration'},
  {title: 'Photo', value: 'photo'},
]

export const libraryImage = defineType({
  name: 'libraryImage',
  title: 'Library image',
  type: 'document',
  icon: ImagesIcon,
  description: 'An approved image a Build can place on a page.',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alt Text', type: 'string', validation: (rule) => rule.required()})],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      description: 'What the image shows, in enough detail to match it to a section.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      type: 'string',
      options: {list: IMAGE_KINDS, layout: 'radio', direction: 'horizontal'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'products',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
  ],
  preview: {
    select: {title: 'title', kind: 'kind', media: 'image'},
    prepare: ({title, kind, media}) => ({title, subtitle: kind, media}),
  },
})
