import {callToAction} from './blocks/callToAction'
import {faqs} from './blocks/faqs'
import {features} from './blocks/features'
import {hero} from './blocks/hero'
import {landingPage} from './landingPage'
import {link} from './objects/link'
import {seo} from './objects/seo'
import {pageBuilder} from './pageBuilder'

export const schemaTypes = [
  // Documents
  landingPage,
  // Page builder
  pageBuilder,
  hero,
  features,
  faqs,
  callToAction,
  // Objects
  link,
  seo,
]
