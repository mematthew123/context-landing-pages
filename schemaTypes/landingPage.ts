import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons/Document'

export const landingPage = defineType({
  name: 'landingPage',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      type: 'pageBuilder',
      group: 'content',
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare({title, slug}) {
      return {
        title: title || 'Untitled',
        subtitle: slug ? `/${slug}` : 'No slug',
      }
    },
  },
})
