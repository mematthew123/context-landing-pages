import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vitest'
import {z} from 'zod/v4'
import {PageSchema} from '../functions/build-page/pageSchema'

// The Zod mirror must stay in step with the Studio schema (studio/schema.json, from `pnpm typegen`)
type SchemaType = {name: string; type: string; value?: {attributes?: Record<string, unknown>}}
const studio: SchemaType[] = JSON.parse(readFileSync(new URL('../../studio/schema.json', import.meta.url), 'utf8'))
const studioType = (name: string) => studio.find((type) => type.name === name)

function literalTypes(schema: unknown): string[] {
  const json = JSON.stringify(z.toJSONSchema(schema as z.ZodType))
  return [...new Set([...json.matchAll(/"_type":\{"type":"string","const":"([^"]+)"/g)].map((m) => m[1]))]
}

function fieldsOf(name: string): string[] {
  const attributes = studioType(name)?.value?.attributes ?? {}
  return Object.keys(attributes).filter((key) => key !== '_type')
}

describe('Zod mirror matches the Studio schema', () => {
  const types = literalTypes(PageSchema)

  it('every block and container the Build can emit exists in the Studio schema', () => {
    const missing = types.filter((name) => !studioType(name))
    expect(missing).toEqual([])
  })

  it('every Studio container is available to the Build', () => {
    const page = studioType('pageBuilderPage')
    const json = JSON.stringify(page)
    const containers = ['pageBuilderSectionHeader', 'pageBuilderMediaWithSection', 'pageBuilderContentGrid', 'pageBuilderSpeedBump']
    for (const name of containers) expect(json).toContain(name)
    for (const name of containers) expect(types).toContain(name)
  })

  it('emitted fields exist on their Studio types', () => {
    const json = z.toJSONSchema(PageSchema) as {$defs?: unknown}
    const walk = (node: unknown, out: {type: string; fields: string[]}[] = []) => {
      if (Array.isArray(node)) node.forEach((child) => walk(child, out))
      else if (node && typeof node === 'object') {
        const obj = node as {properties?: Record<string, {const?: string}>}
        const literal = obj.properties?._type?.const
        if (literal && obj.properties) out.push({type: literal, fields: Object.keys(obj.properties).filter((k) => k !== '_type')})
        Object.values(node).forEach((child) => walk(child, out))
      }
      return out
    }
    const problems = walk(json).flatMap(({type, fields}) =>
      fields.filter((field) => !fieldsOf(type).includes(field)).map((field) => `${type}.${field}`),
    )
    expect(problems).toEqual([])
  })
})
