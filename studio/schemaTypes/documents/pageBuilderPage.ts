import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentsIcon} from '@sanity/icons/Documents'

export const pageBuilderPage = defineType({
  name: 'pageBuilderPage',
  title: 'Landing Page',
  type: 'document',
  icon: DocumentsIcon,
  groups: [
    {name: 'seo', title: 'Meta & SEO', default: true},
    {name: 'hero', title: 'Hero'},
    {name: 'content', title: 'Body'},
    {name: 'faq', title: 'FAQs'},
    {name: 'build', title: 'Build'},
  ],
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      description: 'Identifies the page in Studio; the public title when Meta Title is empty.',
      group: 'seo',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'Served at /lp/[slug].',
      group: 'seo',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'metaTitle',
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.max(70).warning('Keep under 70 characters'),
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (rule) => rule.max(160).warning('Keep under 160 characters'),
    }),
    defineField({
      name: 'socialShareImage',
      type: 'image',
      description: 'OG image, 1200×630.',
      group: 'seo',
    }),
    defineField({name: 'hero', type: 'pageBuilderHero', group: 'hero'}),
    defineField({
      name: 'containers',
      type: 'array',
      description: 'Page sections in display order.',
      group: 'content',
      of: [
        defineArrayMember({type: 'pageBuilderSectionHeader'}),
        defineArrayMember({type: 'pageBuilderMediaWithSection'}),
        defineArrayMember({type: 'pageBuilderContentGrid'}),
        defineArrayMember({type: 'pageBuilderSpeedBump'}),
      ],
    }),
    defineField({name: 'faq', type: 'pageBuilderFaq', group: 'faq'}),
    defineField({
      name: 'brief',
      type: 'reference',
      to: [{type: 'brief'}],
      weak: true,
      readOnly: true,
      description: 'The Brief whose Build produced this page.',
      group: 'build',
    }),
    defineField({
      name: 'buildKey',
      type: 'string',
      readOnly: true,
      hidden: true,
      group: 'build',
    }),
  ],
  preview: {
    select: {title: 'name', slug: 'slug.current'},
    prepare: ({title, slug}) => ({
      title: title || 'Untitled',
      subtitle: slug ? `/lp/${slug}` : 'No slug',
    }),
  },
})
