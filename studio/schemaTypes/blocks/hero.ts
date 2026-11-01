import {defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons/Star'

export const hero = defineType({
  name: 'hero',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'text',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) =>
            rule.custom((alt, context) => {
              const parent = context.parent as {asset?: unknown} | undefined
              return parent?.asset && !alt ? 'Alternative text is required' : true
            }),
        }),
      ],
    }),
    defineField({
      name: 'link',
      type: 'link',
    }),
  ],
  preview: {
    select: {title: 'heading', media: 'image'},
    prepare({title, media}) {
      return {
        title: title || 'Untitled',
        subtitle: 'Hero',
        media: media ?? StarIcon,
      }
    },
  },
})
