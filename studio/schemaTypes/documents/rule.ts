import {defineArrayMember, defineField, defineType} from 'sanity'
import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'

export const RULE_CATEGORIES = [
  {title: 'Voice', value: 'voice'},
  {title: 'Copy mechanics', value: 'copy'},
  {title: 'Terminology', value: 'terminology'},
  {title: 'Composition', value: 'composition'},
  {title: 'SEO', value: 'seo'},
]

export const PAGE_BUILDER_TYPES = [
  'pageBuilderPage',
  'pageBuilderHero',
  'pageBuilderSectionHeader',
  'pageBuilderMediaWithSection',
  'pageBuilderContentGrid',
  'pageBuilderSpeedBump',
  'pageBuilderFaq',
  'pageBuilderEyebrow',
  'pageBuilderHeading',
  'pageBuilderSubheading',
  'pageBuilderText',
  'pageBuilderChecklist',
  'pageBuilderFeatureList',
  'pageBuilderCta',
  'pageBuilderQuote',
  'pageBuilderCallout',
  'pageBuilderImage',
]

export const rule = defineType({
  name: 'rule',
  title: 'Rule',
  type: 'document',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'statement',
      type: 'string',
      description: 'The rule in one line.',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {list: RULE_CATEGORIES, layout: 'radio', direction: 'horizontal'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'appliesTo',
      type: 'array',
      description: 'Only when the rule is about specific page builder types.',
      of: [defineArrayMember({type: 'string'})],
      options: {list: PAGE_BUILDER_TYPES},
    }),
    defineField({name: 'rationale', type: 'text', rows: 3}),
    defineField({
      name: 'examples',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'example',
          type: 'object',
          fields: [
            defineField({name: 'do', type: 'string'}),
            defineField({name: 'dont', title: "Don't", type: 'string'}),
          ],
          preview: {select: {title: 'do', subtitle: 'dont'}},
        }),
      ],
    }),
    defineField({
      name: 'source',
      type: 'object',
      description: 'The Guide this rule was seeded from.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'guide', type: 'string'}),
        defineField({name: 'section', type: 'string'}),
        defineField({name: 'url', type: 'string'}),
      ],
    }),
  ],
  preview: {
    select: {title: 'statement', category: 'category'},
    prepare: ({title, category}) => ({title, subtitle: category}),
  },
})
