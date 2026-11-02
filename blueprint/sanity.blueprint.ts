import {
  defineBlueprint,
  defineContextKnowledgeBase,
  defineContextMcpEndpoint,
  defineDocumentFunction,
} from '@sanity/blueprints'
import 'dotenv/config'
import {DATASET, MCP_ENDPOINT, PROJECT_ID} from './lib/config'

// Never name an env var SANITY_PROJECT_ID here: the Blueprints CLI reads it as a scope override
const {PREVIEW_BASE_URL = 'http://localhost:3000', BUILD_MODEL = 'claude-opus-5-5'} = process.env

const dataset = {type: 'dataset' as const, id: `${PROJECT_ID}.${DATASET}`}

// The org's one Knowledge Base. A deploy creates it empty; scripts/connect-rules.mjs attaches the
// Rules as its dataset source and runs the first build.
const pageRules = defineContextKnowledgeBase({
  name: 'hex-page-rules',
  title: 'Hex page rules',
  description:
    'Editorial rules for turning a marketing brief into a Hex landing page: voice, copy mechanics, terminology, composition, and SEO. It does not contain product facts; facts come only from the brief.',
  lifecycle: {deletionPolicy: 'protect'},
})

export default defineBlueprint({
  resources: [
    pageRules,

    // Knowledge Base mode only. Adding a dataset source here would silently switch it to GROQ mode.
    defineContextMcpEndpoint({
      name: MCP_ENDPOINT,
      title: 'Page builder',
      sources: [pageRules],
      instructions:
        'Overrides take precedence over Rules. The Brief is the only source of facts, numbers, and quotes.',
    }),

    defineDocumentFunction({
      name: 'build-page',
      src: './functions/build-page',
      project: PROJECT_ID,
      timeout: 600,
      memory: 2,
      event: {
        on: ['create', 'update'],
        resource: dataset,
        // Only a new buildRequestedAt starts a Build, so the Function's own patches don't loop
        filter: '_type == "brief" && defined(buildRequestedAt) && delta::changedAny(buildRequestedAt)',
        projection:
          '{_id, title, text, status, submittedVia, buildRequestedAt, "file": document.asset->{url, originalFilename, mimeType, size}}',
      },
      env: {PREVIEW_BASE_URL, BUILD_MODEL},
    }),

    defineDocumentFunction({
      name: 'sync-rules',
      src: './functions/sync-rules',
      project: PROJECT_ID,
      timeout: 600,
      event: {
        on: ['create', 'update', 'delete'],
        resource: dataset,
        filter: '_type == "rule"',
        projection: '{_id, "operation": delta::operation()}',
      },
    }),
  ],
})
