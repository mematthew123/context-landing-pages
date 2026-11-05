// Context endpoint instructions. They live in the repo, so ADR 0003 applies: mechanics and
// precedence only. tests/harness.test.ts checks them for editorial vocabulary.

// Read by the Build
export const PAGE_BUILDER_INSTRUCTIONS =
  'Overrides take precedence over Rules. The Brief is the only source of facts, numbers, and quotes.'

// Read by engineers' coding agents (Cursor, Claude Code) working on the page builder
export const HEX_AUTHORING_INSTRUCTIONS = [
  'This endpoint serves the Rules that marketing maintains in Sanity for building Hex landing pages.',
  'When a task involves page copy, block choice, terminology, images, or SEO, look up the Rules here and treat them as authoritative. Overrides take precedence over Rules.',
  'Structural facts (allowed blocks, fields, and limits) come from the page builder schema in the codebase, not from this endpoint.',
  'Do not restate these Rules in code, comments, prompts, or repository docs, and do not edit them. Rules change in Sanity Studio; if one looks wrong, tell the person and point them to Studio.',
].join('\n')
