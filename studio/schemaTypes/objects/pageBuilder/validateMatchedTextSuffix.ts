import {defineField} from 'sanity'

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}

function isWholeWordSuffix(heading: string, matchedText: string): boolean {
  if (!heading.endsWith(matchedText)) return false
  const start = heading.length - matchedText.length
  return start === 0 || heading[start - 1] === ' '
}

export function validateMatchedTextSuffix(
  matchedText: string | undefined,
  heading: string | undefined,
): true | string {
  if (!matchedText) return true
  if (!heading) return 'Display text requires a heading to match against'
  if (!heading.endsWith(matchedText)) {
    return heading.includes(matchedText)
      ? 'Display text must be a suffix of the heading so nothing trails after the italic phrase'
      : 'Display text must appear exactly at the end of the heading'
  }
  if (heading.indexOf(matchedText) !== heading.length - matchedText.length) {
    return 'Display text must match only at the end of the heading'
  }
  if (!isWholeWordSuffix(heading, matchedText)) {
    return 'Display text must use whole words; never split a word between normal and italic text'
  }
  return true
}

export function validateMatchedTextBalance(
  matchedText: string | undefined,
  heading: string | undefined,
): true | string {
  if (!matchedText || !heading || !isWholeWordSuffix(heading, matchedText)) return true
  const prefix = heading.slice(0, heading.length - matchedText.length)
  return countWords(matchedText) > countWords(prefix)
    ? 'Display text has more words than the phrase before it'
    : true
}

export function matchedTextField(headingField: string) {
  const headingOf = (parent: unknown) =>
    (parent as Record<string, string | undefined> | undefined)?.[headingField]
  return defineField({
    name: 'matchedText',
    title: 'Display Text',
    type: 'string',
    description: 'Italicized. An exact phrase from the end of the heading, in whole words.',
    validation: (rule) => [
      rule
        .custom((matchedText: string | undefined, context) =>
          validateMatchedTextSuffix(matchedText, headingOf(context.parent)),
        )
        .warning(),
      rule
        .custom((matchedText: string | undefined, context) =>
          validateMatchedTextBalance(matchedText, headingOf(context.parent)),
        )
        .warning(),
    ],
  })
}
