import type {CustomValidator} from 'sanity'

export const validateNoAdjacentHeadings: CustomValidator<{_type?: string}[] | undefined> = (
  blocks,
) => {
  const items = blocks ?? []
  const adjacent = items.some(
    (block, index) =>
      block._type === 'pageBuilderHeading' && items[index + 1]?._type === 'pageBuilderHeading',
  )
  return adjacent
    ? 'Two Heading blocks in a row put two same-level headings in the outline. Use a Subheading for the second line.'
    : true
}
