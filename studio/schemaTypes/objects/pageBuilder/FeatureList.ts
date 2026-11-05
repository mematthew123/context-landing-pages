import {defineArrayMember, defineField, defineType} from 'sanity'
import {ThListIcon} from '@sanity/icons/ThList'
import {SparklesIcon} from '@sanity/icons/Sparkles'

export const pageBuilderFeatureListItem = defineType({
  name: 'pageBuilderFeatureListItem',
  title: 'Feature',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'body', type: 'text', rows: 3}),
  ],
  preview: {select: {title: 'title', subtitle: 'body'}},
})

export const pageBuilderFeatureList = defineType({
  name: 'pageBuilderFeatureList',
  title: 'Feature List',
  type: 'object',
  icon: ThListIcon,
  fields: [
    defineField({
      name: 'items',
      title: 'Features',
      type: 'array',
      description: 'Two to six features, each a title with a short body.',
      of: [defineArrayMember({type: 'pageBuilderFeatureListItem'})],
      validation: (rule) =>
        rule.required().min(2).max(6).error('A feature list holds two to six features'),
    }),
  ],
  preview: {
    select: {items: 'items'},
    prepare: ({items}) => {
      const count = items?.length ?? 0
      return {
        title: items?.[0]?.title || 'Untitled feature list',
        subtitle: `Feature List · ${count} feature${count === 1 ? '' : 's'}`,
        media: ThListIcon,
      }
    },
  },
})
