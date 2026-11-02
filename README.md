# context-landing-pages

Monorepo for the landing pages site. A marketer submits a brief; a Sanity Function builds a draft landing page from it, reading every editorial rule from a Sanity Context Knowledge Base at build time.

- `web/` — Next.js frontend, deployed to Vercel (project root directory: `web`). `/lp/[slug]` pages, draft mode for Presentation, `/preview/[token]` build previews, `/brief` submission form.
- `studio/` — Sanity Studio: the page builder schema, Briefs, Rules, and the "Build page" action.
- `blueprint/` — Sanity Blueprint: the Knowledge Base, its Context MCP endpoint, and the `build-page` and `sync-rules` Functions.

Each app keeps its own `package.json` and `pnpm-lock.yaml`; run commands from inside the app folder.

## Setup

1. **Studio:** `pnpm typegen` after schema changes (writes `studio/schema.json` and `web/sanity.types.d.ts`), then `npx sanity schema deploy`.
2. **Web:** `web/.env.local` needs `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN` (Viewer), `SANITY_API_WRITE_TOKEN` (Editor, for `/brief`), and optionally `NEXT_PUBLIC_SANITY_STUDIO_URL`.
3. **Blueprint** (from `blueprint/`, signed in with a personal login):
   ```sh
   pnpm dlx sanity@latest blueprints init . --blueprint-type ts --organization-id otj10m0k9 --stack-name production
   pnpm run deploy
   pnpm dlx sanity@latest functions env add build-page ANTHROPIC_API_KEY <key>
   pnpm dlx sanity@latest functions env add build-page SANITY_CONTEXT_TOKEN <org token, Context Viewer>
   pnpm dlx sanity@latest functions env add sync-rules SANITY_CONTEXT_TOKEN <org token, Context Editor>
   pnpm run connect-rules   # attach published Rules to the Knowledge Base and build it
   ```
   Context only accepts **organization** tokens. Optional `build-page` env: `SLACK_WEBHOOK_URL`, `BUILD_DAILY_CAP` (default 50).
4. `pnpm test` in `blueprint/` checks that the Build's output schema matches the Studio schema and that the harness prompt holds no editorial instructions.
