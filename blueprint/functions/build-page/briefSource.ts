import mammoth from 'mammoth'
import {DATASET, PROJECT_ID} from '../../lib/config'
import type {BriefContent} from './harness'

const MAX_BYTES = 10 * 1024 * 1024
const FILE_PREFIX = `https://cdn.sanity.io/files/${PROJECT_ID}/${DATASET}/`

export type BriefEvent = {
  _id: string
  title?: string
  text?: string
  file?: {url?: string; originalFilename?: string; mimeType?: string; size?: number} | null
}

// A Brief is read as-is: pasted text, or the uploaded file handed to Claude as a document
export async function briefContent(brief: BriefEvent): Promise<BriefContent> {
  const title = brief.title || 'Brief'
  if (brief.file?.url && brief.text) throw new Error('The Brief has both a document and text; keep one')
  if (brief.text?.trim()) {
    return {type: 'document', title, source: {type: 'text', media_type: 'text/plain', data: brief.text}}
  }
  if (!brief.file?.url) throw new Error('The Brief has no document or text')
  if (!brief.file.url.startsWith(FILE_PREFIX)) throw new Error('The Brief document is not in this dataset')
  if ((brief.file.size ?? 0) > MAX_BYTES) throw new Error('Keep the Brief document under 10 MB')

  const res = await fetch(brief.file.url)
  if (!res.ok) throw new Error(`Could not download the Brief document (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const name = brief.file.originalFilename ?? title
  const mime = brief.file.mimeType ?? ''

  if (mime === 'application/pdf' || name.endsWith('.pdf')) {
    return {type: 'document', title: name, source: {type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64')}}
  }
  const text = name.endsWith('.docx') ? (await mammoth.extractRawText({buffer})).value : buffer.toString('utf8')
  if (!text.trim()) throw new Error('The Brief document has no readable text')
  return {type: 'document', title: name, source: {type: 'text', media_type: 'text/plain', data: text}}
}
