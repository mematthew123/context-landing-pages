import {brief} from './documents/brief'
import {frontDoorScript} from './documents/frontDoorScript'
import {libraryImage} from './documents/libraryImage'
import {pageBuilderPage} from './documents/pageBuilderPage'
import {rule} from './documents/rule'
import {rulesSyncStatus} from './documents/rulesSyncStatus'
import {simpleBlockContent} from './objects/simpleBlockContent'
import {pageBuilderCallout} from './objects/pageBuilder/Callout'
import {pageBuilderChecklist} from './objects/pageBuilder/Checklist'
import {pageBuilderContentGrid, pageBuilderContentGridCell} from './objects/pageBuilder/ContentGrid'
import {pageBuilderCta} from './objects/pageBuilder/Cta'
import {pageBuilderEyebrow} from './objects/pageBuilder/Eyebrow'
import {pageBuilderFaq, pageBuilderFaqItem} from './objects/pageBuilder/Faq'
import {pageBuilderFeatureList, pageBuilderFeatureListItem} from './objects/pageBuilder/FeatureList'
import {pageBuilderHeading} from './objects/pageBuilder/Heading'
import {pageBuilderHero} from './objects/pageBuilder/Hero'
import {pageBuilderImage} from './objects/pageBuilder/Image'
import {pageBuilderMediaWithSection} from './objects/pageBuilder/MediaWithSection'
import {pageBuilderQuote} from './objects/pageBuilder/Quote'
import {pageBuilderSectionHeader} from './objects/pageBuilder/SectionHeader'
import {pageBuilderSpeedBump} from './objects/pageBuilder/SpeedBump'
import {pageBuilderSubheading} from './objects/pageBuilder/Subheading'
import {pageBuilderText} from './objects/pageBuilder/Text'

export const schemaTypes = [
  // Documents
  pageBuilderPage,
  brief,
  rule,
  rulesSyncStatus,
  frontDoorScript,
  libraryImage,
  // Page-level sections
  pageBuilderHero,
  pageBuilderFaq,
  pageBuilderFaqItem,
  // Containers
  pageBuilderSectionHeader,
  pageBuilderMediaWithSection,
  pageBuilderContentGrid,
  pageBuilderContentGridCell,
  pageBuilderSpeedBump,
  // Blocks
  pageBuilderEyebrow,
  pageBuilderHeading,
  pageBuilderSubheading,
  pageBuilderText,
  pageBuilderChecklist,
  pageBuilderFeatureList,
  pageBuilderFeatureListItem,
  pageBuilderCta,
  pageBuilderQuote,
  pageBuilderCallout,
  pageBuilderImage,
  // Objects
  simpleBlockContent,
]
