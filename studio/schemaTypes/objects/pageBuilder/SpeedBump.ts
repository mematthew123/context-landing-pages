import {defineField, defineType} from 'sanity'
import {BoltIcon} from '@sanity/icons/Bolt'
import {pageBuilderBlockMembers} from './blockMembers'
import {getContainerPreview} from './getContainerPreview'
import {validateNoAdjacentHeadings} from './validateNoAdjacentHeadings'

export const pageBuilderSpeedBump = defineType({
  name: 'pageBuilderSpeedBump',
  title: 'Speed Bump',
  type: 'object',
  icon: BoltIcon,
  description: 'Centered 560px card, usually a heading and a CTA.',
  fields: [
    defineField({
      name: 'blocks',
      type: 'array',
      description: 'One to four blocks.',
      of: pageBuilderBlockMembers,
      validation: (rule) => [
        rule.required().min(1).max(4).error('A speed bump holds one to four blocks'),
        rule.custom(validateNoAdjacentHeadings).warning(),
      ],
    }),
    defineField({
      name: 'background',
      type: 'string',
      options: {
        list: [
          {title: 'Lines', value: 'lines'},
          {title: 'Gradient', value: 'gradient'},
          {title: 'Solid', value: 'solid'},
        ],
        layout: 'radio',
      },
      initialValue: 'lines',
    }),
  ],
  preview: {
    select: {blocks: 'blocks', background: 'background'},
    prepare: ({blocks, background}) => {
      const preview = getContainerPreview(blocks, 'Speed Bump')
      return {
        title: preview.title,
        subtitle: `${preview.subtitle}${background ? ` · ${background}` : ''}`,
        media: BoltIcon,
      }
    },
  },
})
