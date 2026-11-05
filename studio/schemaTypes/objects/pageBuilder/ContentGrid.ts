import {defineArrayMember, defineField, defineType} from 'sanity'
import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {BlockElementIcon} from '@sanity/icons/BlockElement'

export const pageBuilderContentGridCell = defineType({
  name: 'pageBuilderContentGridCell',
  title: 'Cell',
  type: 'object',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'blocks',
      type: 'array',
      of: [
        defineArrayMember({type: 'pageBuilderEyebrow'}),
        defineArrayMember({type: 'pageBuilderSubheading'}),
        defineArrayMember({type: 'pageBuilderText', title: 'Body Text'}),
        defineArrayMember({type: 'pageBuilderChecklist'}),
        defineArrayMember({type: 'pageBuilderFeatureList'}),
        defineArrayMember({type: 'pageBuilderImage'}),
        defineArrayMember({type: 'pageBuilderCta'}),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {blocks: 'blocks'},
    prepare: ({blocks}) => {
      const title = blocks?.find(
        (block: {_type?: string}) => block._type === 'pageBuilderSubheading',
      )?.text
      const count = blocks?.length ?? 0
      return {
        title: title || 'Cell',
        subtitle: `${count} block${count === 1 ? '' : 's'}`,
        media: BlockElementIcon,
      }
    },
  },
})

export const pageBuilderContentGrid = defineType({
  name: 'pageBuilderContentGrid',
  title: 'Content Grid',
  type: 'object',
  icon: ThLargeIcon,
  description: 'A heading over a grid of cards. Each cell holds its own blocks.',
  fields: [
    defineField({name: 'heading', type: 'string'}),
    defineField({
      name: 'cells',
      type: 'array',
      description: 'One to forty cells.',
      of: [defineArrayMember({type: 'pageBuilderContentGridCell'})],
      validation: (rule) => rule.required().min(1).max(40),
    }),
  ],
  preview: {
    select: {cells: 'cells', heading: 'heading'},
    prepare: ({cells, heading}) => {
      const count = cells?.length ?? 0
      return {
        title: heading || 'Content Grid',
        subtitle: `Content Grid · ${count} cell${count === 1 ? '' : 's'}`,
        media: ThLargeIcon,
      }
    },
  },
})
