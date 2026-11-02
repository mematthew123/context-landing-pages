import {describe, expect, it} from 'vitest'
import {z} from 'zod/v4'
import {HARNESS_PROMPT} from '../functions/build-page/harness'
import {BuildOutputSchema} from '../functions/build-page/pageSchema'

// ADR 0003: the repo holds Build mechanics, never editorial judgment. If one of these words is
// needed, the instruction is a Rule and belongs in Sanity.
const EDITORIAL = [
  'voice', 'tone', 'concise', 'compelling', 'punchy', 'engaging', 'persuasive', 'friendly', 'catchy',
  'crisp', 'brand', 'style', 'jargon', 'benefit', 'tagline', 'witty', 'bold claim', 'competitor',
  'sentence case', 'oxford', 'exclamation', 'readable', 'clarity',
]

function descriptions(schema: unknown): string[] {
  const json = JSON.stringify(z.toJSONSchema(schema as z.ZodType))
  return [...json.matchAll(/"description":"((?:[^"\\]|\\.)*)"/g)].map((match) => match[1])
}

describe('no authoring prose in the repo', () => {
  const texts = {'harness prompt': HARNESS_PROMPT, 'schema descriptions': descriptions(BuildOutputSchema).join('\n')}
  for (const [name, text] of Object.entries(texts)) {
    it(`${name} has no editorial vocabulary`, () => {
      const found = EDITORIAL.filter((word) => new RegExp(`\\b${word}`, 'i').test(text))
      expect(found, `move these instructions into Rules: ${found.join(', ')}`).toEqual([])
    })
  }
})
