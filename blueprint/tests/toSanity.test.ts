import {describe, expect, it} from 'vitest'
import {checkLimits, type PageOutput} from '../functions/build-page/pageSchema'
import {markdownToPortableText} from '../functions/build-page/toSanity'

describe('markdownToPortableText', () => {
  it('turns paragraphs, bullets, bold and links into blocks', () => {
    const blocks = markdownToPortableText('See [Threads](https://hex.tech/product/threads/) **now**.\n\n- one\n- two')
    expect(blocks).toHaveLength(3)
    expect(blocks[0].children.map((child) => child.text)).toEqual(['See ', 'Threads', ' ', 'now', '.'])
    expect(blocks[0].markDefs[0].href).toBe('https://hex.tech/product/threads/')
    expect(blocks[0].children[3].marks).toEqual(['strong'])
    expect(blocks[1].listItem).toBe('bullet')
  })
})

describe('checkLimits', () => {
  const page: PageOutput = {
    name: 'Test',
    slug: 'data-leaders',
    metaTitle: 'Test',
    metaDescription: 'Test',
    hero: {heading: 'Hello', ctas: [{text: 'a', href: '/a'}]},
    containers: [
      {
        _type: 'pageBuilderSpeedBump',
        blocks: [
          {_type: 'pageBuilderHeading', text: 'One', matchedText: 'ne'},
          {_type: 'pageBuilderHeading', text: 'Two'},
        ],
      },
    ],
  }

  it('reports broken suffixes and adjacent headings', () => {
    const errors = checkLimits(page)
    expect(errors.some((e) => e.includes('whole-word suffix'))).toBe(true)
    expect(errors.some((e) => e.includes('two Heading blocks'))).toBe(true)
  })

  it('passes a valid page', () => {
    expect(checkLimits({...page, containers: []})).toEqual([])
  })
})
