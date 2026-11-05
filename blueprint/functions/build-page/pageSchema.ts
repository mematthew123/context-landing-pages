import {z} from 'zod/v4'

// The Build's output contract: a mirror of the Studio page builder schema in authoring form (no
// _keys, rich text as Markdown). Descriptions here state structure only, never editorial judgment
// (tests/harness.test.ts enforces that). Limits the model may not honour are checked in checkLimits.

const cta = z.object({text: z.string(), href: z.string().describe('Full URL or a site path')})
const markdown = (what: string) =>
  z.string().describe(`${what}. Markdown: paragraphs, **bold**, *italic*, [links](url), "- " bullets`)

// How a media slot is filled: a library image by id, a prompt to generate one, or neither (a
// Placeholder). alt describes the image either way.
const mediaSlot = z
  .object({
    libraryImage: z.string().optional().describe('_id of an Image library entry'),
    imagePrompt: z.string().optional().describe('Prompt for a generated image'),
    alt: z.string().optional(),
  })
  .describe('Omit to leave a Placeholder')

const eyebrow = z.object({_type: z.literal('pageBuilderEyebrow'), text: z.string().describe('At most 40 characters')})
const heading = z.object({
  _type: z.literal('pageBuilderHeading'),
  text: z.string(),
  matchedText: z.string().optional().describe('Exact whole-word suffix of text, rendered italic'),
})
const subheading = z.object({_type: z.literal('pageBuilderSubheading'), text: z.string()})
const text = z.object({_type: z.literal('pageBuilderText'), body: markdown('Body')})
const checklist = z.object({
  _type: z.literal('pageBuilderChecklist'),
  items: z.array(z.string()).describe('1 to 8 items, each at most 120 characters'),
})
const featureList = z.object({
  _type: z.literal('pageBuilderFeatureList'),
  items: z.array(z.object({title: z.string(), body: z.string().optional()})).describe('2 to 6 items'),
})
const ctaBlock = cta.extend({_type: z.literal('pageBuilderCta')})
const quote = z.object({
  _type: z.literal('pageBuilderQuote'),
  quote: z.string(),
  highlightedText: z.string().optional().describe('Exact phrase from the quote'),
  author: z.string(),
  authorTitle: z.string().optional(),
  company: z.string().optional(),
})
const callout = z.object({
  _type: z.literal('pageBuilderCallout'),
  title: z.string(),
  body: markdown('Body').optional(),
})
const image = z.object({
  _type: z.literal('pageBuilderImage'),
  image: mediaSlot.optional(),
  placeholderNote: z.string().describe('What image belongs here'),
})

const sectionBlock = z.discriminatedUnion('_type', [
  eyebrow,
  heading,
  subheading,
  text,
  checklist,
  featureList,
  ctaBlock,
  quote,
  callout,
])
const cellBlock = z.discriminatedUnion('_type', [eyebrow, subheading, text, checklist, featureList, image, ctaBlock])

const sectionHeader = z.object({
  _type: z.literal('pageBuilderSectionHeader'),
  eyebrow: z.string().optional(),
  heading: z.string(),
  matchedText: z.string().optional(),
  subheading: z.string().optional(),
  ctas: z.array(cta).optional().describe('At most 2'),
})
const mediaWithSection = z.object({
  _type: z.literal('pageBuilderMediaWithSection'),
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  matchedText: z.string().optional(),
  media: mediaSlot.optional(),
  placeholderNote: z.string().describe('What image belongs beside this section'),
  blocks: z.array(sectionBlock).describe('At least 1'),
})
const contentGrid = z.object({
  _type: z.literal('pageBuilderContentGrid'),
  heading: z.string().optional(),
  cells: z.array(z.object({blocks: z.array(cellBlock)})).describe('1 to 40 cells'),
})
const speedBump = z.object({
  _type: z.literal('pageBuilderSpeedBump'),
  background: z.enum(['lines', 'gradient', 'solid']).optional(),
  blocks: z.array(sectionBlock).describe('1 to 4 blocks'),
})

export const PageSchema = z.object({
  name: z.string().describe('Internal page name'),
  slug: z.string().describe('Lowercase words joined by hyphens'),
  metaTitle: z.string().describe('At most 70 characters'),
  metaDescription: z.string().describe('At most 160 characters'),
  hero: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().describe("The page's only h1"),
    subheading: z.string().optional(),
    ctas: z.array(cta).optional().describe('At most 2; the first renders as the primary button'),
  }),
  containers: z.array(z.discriminatedUnion('_type', [sectionHeader, mediaWithSection, contentGrid, speedBump])),
  faq: z
    .object({
      heading: z.string().optional(),
      items: z.array(z.object({title: z.string(), description: markdown('Answer')})),
    })
    .optional(),
})

export const BuildOutputSchema = z.object({
  page: PageSchema,
  report: z.object({
    appliedRules: z
      .array(z.object({ruleId: z.string().optional(), statement: z.string(), where: z.string()}))
      .describe('Every Rule applied: its id when the Knowledge Base cites one, its statement, and where it was applied'),
    dropped: z.array(z.string()).describe('Brief content left off the page, each with the reason'),
    placeholders: z.array(z.string()).describe('Every empty media slot and what belongs there'),
    gaps: z.array(z.string()).describe('What the page needed that the Brief did not say'),
  }),
})

export type PageOutput = z.infer<typeof PageSchema>
export type MediaSlot = z.infer<typeof mediaSlot>
export type OutputBlock = z.infer<typeof sectionBlock> | z.infer<typeof cellBlock>
export type BuildOutput = z.infer<typeof BuildOutputSchema>

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Studio validation as plain checks, so a repair turn can quote exactly what broke
export function checkLimits(page: PageOutput): string[] {
  const errors: string[] = []
  const at = (path: string, message: string) => errors.push(`${path}: ${message}`)

  if (!SLUG.test(page.slug)) at('slug', 'must be lowercase words joined by single hyphens')
  if ((page.hero.ctas?.length ?? 0) > 2) at('hero.ctas', 'at most 2')
  if (page.hero.eyebrow && page.hero.eyebrow.length > 40) at('hero.eyebrow', 'at most 40 characters')

  const checkBlocks = (path: string, blocks: OutputBlock[]) => {
    blocks.forEach((block, i) => {
      const p = `${path}[${i}]`
      switch (block._type) {
        case 'pageBuilderEyebrow':
          if (block.text.length > 40) at(p, 'eyebrow at most 40 characters')
          break
        case 'pageBuilderChecklist':
          if (block.items.length < 1 || block.items.length > 8) at(p, 'checklist holds 1 to 8 items')
          if (block.items.some((item) => item.length > 120)) at(p, 'checklist items at most 120 characters')
          break
        case 'pageBuilderFeatureList':
          if (block.items.length < 2 || block.items.length > 6) at(p, 'feature list holds 2 to 6 items')
          break
        case 'pageBuilderHeading':
          if (block.matchedText && !isWholeWordSuffix(block.text, block.matchedText))
            at(p, 'matchedText must be a whole-word suffix of text')
          if (blocks[i + 1]?._type === 'pageBuilderHeading')
            at(p, 'two Heading blocks in a row; use a Subheading for the second')
          break
      }
    })
  }

  page.containers.forEach((container, i) => {
    const p = `containers[${i}]`
    if ('matchedText' in container && container.matchedText && !isWholeWordSuffix(container.heading ?? '', container.matchedText))
      at(p, 'matchedText must be a whole-word suffix of heading')
    if (container._type === 'pageBuilderSectionHeader' && (container.ctas?.length ?? 0) > 2) at(p, 'at most 2 CTAs')
    if (container._type === 'pageBuilderMediaWithSection') {
      if (container.blocks.length < 1) at(p, 'needs at least 1 block')
      checkBlocks(`${p}.blocks`, container.blocks)
    }
    if (container._type === 'pageBuilderSpeedBump') {
      if (container.blocks.length < 1 || container.blocks.length > 4) at(p, 'speed bump holds 1 to 4 blocks')
      checkBlocks(`${p}.blocks`, container.blocks)
    }
    if (container._type === 'pageBuilderContentGrid') {
      if (container.cells.length < 1 || container.cells.length > 40) at(p, 'content grid holds 1 to 40 cells')
      container.cells.forEach((cell, c) => {
        if (cell.blocks.length < 1) at(`${p}.cells[${c}]`, 'needs at least 1 block')
        checkBlocks(`${p}.cells[${c}].blocks`, cell.blocks)
      })
    }
  })
  return errors
}

function isWholeWordSuffix(heading: string, suffix: string) {
  if (!heading.endsWith(suffix) || heading.indexOf(suffix) !== heading.length - suffix.length) return false
  const start = heading.length - suffix.length
  return start === 0 || heading[start - 1] === ' '
}
