import {defineField} from 'sanity'

// Subfields every page builder image carries, so a Draft page records where its image came from
export const mediaFields = [
  defineField({name: 'alt', title: 'Alt Text', type: 'string'}),
  defineField({
    name: 'libraryImage',
    type: 'reference',
    to: [{type: 'libraryImage'}],
    weak: true,
    readOnly: true,
    description: 'The Image library entry a Build placed here.',
  }),
  defineField({
    name: 'imagePrompt',
    type: 'text',
    rows: 2,
    description: 'The prompt a Build generated this image from.',
  }),
]
