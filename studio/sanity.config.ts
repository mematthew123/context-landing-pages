import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {SINGLETON_TYPES, structure} from './structure'
import {resolve} from './presentation'
import {BuildPageAction} from './actions/BuildPageAction'

const previewUrl =
  process.env.SANITY_STUDIO_PREVIEW_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://web-phi-three-79.vercel.app' : 'http://localhost:3000')

export default defineConfig({
  name: 'default',
  title: 'Context Landing Pages',

  projectId: '3y29l7xh',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    presentationTool({
      resolve,
      previewUrl: {initial: previewUrl, previewMode: {enable: '/api/draft-mode/enable'}},
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETON_TYPES.has(schemaType)),
  },

  document: {
    actions: (prev, context) => {
      if (SINGLETON_TYPES.has(context.schemaType)) return []
      return context.schemaType === 'brief' ? [BuildPageAction, ...prev] : prev
    },
  },
})
