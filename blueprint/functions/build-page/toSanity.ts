import {randomUUID} from 'node:crypto'
import type {OutputBlock, PageOutput} from './pageSchema'

const key = () => randomUUID().replaceAll('-', '').slice(0, 12)

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

function block(input: OutputBlock): Record<string, unknown> {
  const base = {_key: key()}
  switch (input._type) {
    case 'pageBuilderText':
      return {...base, _type: input._type, body: markdownToPortableText(input.body)}
    case 'pageBuilderCallout':
      return {...base, ...input, body: input.body ? markdownToPortableText(input.body) : undefined}
    case 'pageBuilderFeatureList':
      return {...base, ...input, items: input.items.map((item) => ({_key: key(), _type: 'pageBuilderFeatureListItem', ...item}))}
    case 'pageBuilderImage':
      return {...base, _type: input._type, placeholderNote: input.placeholderNote}
    default:
      return {...base, ...input}
  }
}

const ctas = (list: {text: string; href: string}[] | undefined) =>
  list?.map((cta) => ({_key: key(), _type: 'pageBuilderCta', ...cta}))

export function toPageDocument(page: PageOutput) {
  return {
    _type: 'pageBuilderPage',
    name: page.name,
    slug: {_type: 'slug', current: page.slug},
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    hero: {_type: 'pageBuilderHero', ...page.hero, ctas: ctas(page.hero.ctas)},
    containers: page.containers.map((container) => {
      switch (container._type) {
        case 'pageBuilderSectionHeader':
          return {_key: key(), ...container, ctas: ctas(container.ctas)}
        case 'pageBuilderMediaWithSection':
        case 'pageBuilderSpeedBump':
          return {_key: key(), ...container, blocks: container.blocks.map(block)}
        case 'pageBuilderContentGrid':
          return {
            _key: key(),
            ...container,
            cells: container.cells.map((cell) => ({
              _key: key(),
              _type: 'pageBuilderContentGridCell',
              blocks: cell.blocks.map(block),
            })),
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
}
