import {defineArrayMember, defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons/Star'

export const pageBuilderHero = defineType({
  name: 'pageBuilderHero',
  title: 'Hero',
  type: 'object',
  icon: StarIcon,
  description: "The page's only h1. Renders an animated backdrop.",
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'string',
      validation: (rule) => rule.max(40).error('An eyebrow is at most 40 characters'),
    }),
    defineField({name: 'heading', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'subheading', type: 'text', rows: 2}),
    defineField({
      name: 'ctas',
      title: 'CTAs',
      type: 'array',
      description: 'Up to two. The first renders loud.',
      of: [defineArrayMember({type: 'pageBuilderCta'})],
      validation: (rule) => rule.max(2).error('A hero holds at most two CTAs'),
    }),
  ],
  preview: {
    select: {title: 'heading', subtitle: 'subheading'},
    prepare: ({title, subtitle}) => ({
      title: title || 'Untitled hero',
      subtitle: subtitle || 'Hero',
      media: StarIcon,
    }),
  },
})
