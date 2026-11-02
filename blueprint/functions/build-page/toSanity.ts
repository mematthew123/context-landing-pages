import {randomUUID} from 'node:crypto'
import type {MediaSlot, OutputBlock, PageOutput} from './pageSchema'

const key = () => randomUUID().replaceAll('-', '').slice(0, 12)

export type LibraryImage = {_id: string; assetId: string; alt: string}
type PathSegment = string | {_key: string}
// An image slot left for the generation step: where it is in the page and what to generate
export type ImageJob = {path: PathSegment[]; prompt: string; alt?: string}

type Context = {library: Map<string, LibraryImage>; jobs: ImageJob[]; placed: string[]}

// A media slot as stored: a library asset, an empty image carrying its prompt for the generation
// step, or nothing (a Placeholder)
function media(slot: MediaSlot | undefined, path: PathSegment[], ctx: Context) {
  const libraryImage = slot?.libraryImage ? ctx.library.get(slot.libraryImage) : undefined
  if (libraryImage) {
    ctx.placed.push(`${libraryImage._id} at ${describe(path)}`)
    return {
      _type: 'image',
      asset: {_type: 'reference', _ref: libraryImage.assetId},
      alt: slot?.alt || libraryImage.alt,
      libraryImage: {_type: 'reference', _ref: libraryImage._id, _weak: true},
    }
  }
  if (slot?.imagePrompt) {
    ctx.jobs.push({path, prompt: slot.imagePrompt, alt: slot.alt})
    return {_type: 'image', alt: slot.alt, imagePrompt: slot.imagePrompt}
  }
  return undefined
}

const describe = (path: PathSegment[]) => path.map((s) => (typeof s === 'string' ? s : `[${s._key}]`)).join('.')

type Span = {_type: 'span'; _key: string; text: string; marks: string[]}
type MarkDef = {_type: 'link'; _key: string; href: string}
type PortableBlock = {
  _type: 'block'
  _key: string
  style: 'normal'
  children: Span[]
  markDefs: MarkDef[]
  listItem?: 'bullet'
  level?: number
}

const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g

function parseInline(line: string): Pick<PortableBlock, 'children' | 'markDefs'> {
  const children: Span[] = []
  const markDefs: MarkDef[] = []
  const push = (text: string, marks: string[] = []) => text && children.push({_type: 'span', _key: key(), text, marks})
  let last = 0
  for (const match of line.matchAll(INLINE)) {
    push(line.slice(last, match.index))
    const [, linkText, href, bold, italic] = match
    if (linkText) {
      const def: MarkDef = {_type: 'link', _key: key(), href}
      markDefs.push(def)
      push(linkText, [def._key])
    } else if (bold) push(bold, ['strong'])
    else if (italic) push(italic, ['em'])
    last = match.index + match[0].length
  }
  push(line.slice(last))
  if (children.length === 0) push(' ')
  return {children, markDefs}
}

// Small Markdown subset to Portable Text: paragraphs, bullets, bold, italic, links
export function markdownToPortableText(markdown: string): PortableBlock[] {
  const blocks: PortableBlock[] = []
  for (const chunk of markdown.replaceAll('\r', '').split(/\n{2,}/)) {
    const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean)
    if (lines.length === 0) continue
    if (lines.every((line) => /^[-*] /.test(line))) {
      for (const line of lines)
        blocks.push({_type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, ...parseInline(line.slice(2))})
    } else {
      blocks.push({_type: 'block', _key: key(), style: 'normal', ...parseInline(lines.join(' '))})
    }
  }
  return blocks
}

function block(input: OutputBlock, path: PathSegment[], ctx: Context): Record<string, unknown> {
  const base = {_key: key()}
  const here = [...path, {_key: base._key}]
  switch (input._type) {
    case 'pageBuilderText':
      return {...base, _type: input._type, body: markdownToPortableText(input.body)}
    case 'pageBuilderCallout':
      return {...base, ...input, body: input.body ? markdownToPortableText(input.body) : undefined}
    case 'pageBuilderFeatureList':
      return {...base, ...input, items: input.items.map((item) => ({_key: key(), _type: 'pageBuilderFeatureListItem', ...item}))}
    case 'pageBuilderImage':
      return {
        ...base,
        _type: input._type,
        image: media(input.image, [...here, 'image'], ctx),
        placeholderNote: input.placeholderNote,
      }
    default:
      return {...base, ...input}
  }
}

const ctas = (list: {text: string; href: string}[] | undefined) =>
  list?.map((cta) => ({_key: key(), _type: 'pageBuilderCta', ...cta}))

export function toPageDocument(page: PageOutput, library: LibraryImage[] = []) {
  const ctx: Context = {library: new Map(library.map((image) => [image._id, image])), jobs: [], placed: []}
  const document = {
    _type: 'pageBuilderPage',
    name: page.name,
    slug: {_type: 'slug', current: page.slug},
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    hero: {_type: 'pageBuilderHero', ...page.hero, ctas: ctas(page.hero.ctas)},
    containers: page.containers.map((container) => {
      const _key = key()
      const here: PathSegment[] = ['containers', {_key}]
      switch (container._type) {
        case 'pageBuilderSectionHeader':
          return {_key, ...container, ctas: ctas(container.ctas)}
        case 'pageBuilderMediaWithSection':
          return {
            _key,
            ...container,
            media: media(container.media, [...here, 'media'], ctx),
            blocks: container.blocks.map((b) => block(b, [...here, 'blocks'], ctx)),
          }
        case 'pageBuilderSpeedBump':
          return {_key, ...container, blocks: container.blocks.map((b) => block(b, [...here, 'blocks'], ctx))}
        case 'pageBuilderContentGrid':
          return {
            _key,
            ...container,
            cells: container.cells.map((cell) => {
              const cellKey = key()
              return {
                _key: cellKey,
                _type: 'pageBuilderContentGridCell',
                blocks: cell.blocks.map((b) => block(b, [...here, 'cells', {_key: cellKey}, 'blocks'], ctx)),
              }
            }),
          }
      }
    }),
    faq: page.faq && {
      _type: 'pageBuilderFaq',
      heading: page.faq.heading,
      items: page.faq.items.map((item) => ({
        _key: key(),
        _type: 'pageBuilderFaqItem',
        title: item.title,
        description: markdownToPortableText(item.description),
      })),
    },
  }
  return {document, imageJobs: ctx.jobs, imagesPlaced: ctx.placed}
}
