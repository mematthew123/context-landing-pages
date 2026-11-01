type PreviewBlock = {_type?: string; text?: string; title?: string}

export function getContainerPreview(blocks: PreviewBlock[] | undefined, containerTitle: string) {
  const items = blocks ?? []
  const lead = items.find(
    (block) => block._type === 'pageBuilderHeading' || block._type === 'pageBuilderCallout',
  )
  const count = items.length
  return {
    title: lead?.text || lead?.title || containerTitle,
    subtitle: `${containerTitle} · ${count} block${count === 1 ? '' : 's'}`,
  }
}
