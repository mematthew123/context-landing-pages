import {defineField, defineType} from 'sanity'
import {SplitHorizontalIcon} from '@sanity/icons/SplitHorizontal'
import {pageBuilderBlockMembers} from './blockMembers'
import {getContainerPreview} from './getContainerPreview'
import {matchedTextField} from './validateMatchedTextSuffix'
import {validateNoAdjacentHeadings} from './validateNoAdjacentHeadings'
import {mediaFields} from './mediaFields'

export const pageBuilderMediaWithSection = defineType({
  name: 'pageBuilderMediaWithSection',
  title: 'Media With Section',
  type: 'object',
  icon: SplitHorizontalIcon,
  description:
    'A heading over an image beside a column of blocks. Media sides alternate automatically down the page.',
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'string',
      validation: (rule) => rule.max(40).error('An eyebrow is at most 40 characters'),
    }),
    defineField({name: 'heading', type: 'string'}),
    matchedTextField('heading'),
    defineField({
      name: 'media',
      title: 'Image',
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
    defineField({
      name: 'blocks',
      title: 'Section',
      type: 'array',
      description: 'Content shown beside the media.',
      of: pageBuilderBlockMembers,
      validation: (rule) => [
        rule.required().min(1).error('Add at least one block'),
        rule.custom(validateNoAdjacentHeadings).warning(),
      ],
    }),
  ],
  preview: {
    select: {blocks: 'blocks', heading: 'heading', media: 'media'},
    prepare: ({blocks, heading, media}) => {
      const preview = getContainerPreview(blocks, 'Media With Section')
      return {
        title: heading || preview.title,
        subtitle: preview.subtitle,
        media: media || SplitHorizontalIcon,
      }
    },
  },
})
