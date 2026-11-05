type Block = {_type?: string; children?: {text?: string}[]}

export function portableTextPreview(value: Block[] | undefined): string {
  return (value ?? [])
    .filter((block) => block._type === 'block')
    .map((block) => (block.children ?? []).map((child) => child.text ?? '').join(''))
    .join(' ')
    .slice(0, 120)
}
