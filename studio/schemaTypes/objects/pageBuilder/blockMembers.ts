import {defineArrayMember} from 'sanity'

// Blocks allowed in Media With Section and Speed Bump
export const pageBuilderBlockMembers = [
  defineArrayMember({type: 'pageBuilderEyebrow'}),
  defineArrayMember({type: 'pageBuilderHeading'}),
  defineArrayMember({type: 'pageBuilderSubheading'}),
  defineArrayMember({type: 'pageBuilderText'}),
  defineArrayMember({type: 'pageBuilderChecklist'}),
  defineArrayMember({type: 'pageBuilderFeatureList'}),
  defineArrayMember({type: 'pageBuilderCta'}),
  defineArrayMember({type: 'pageBuilderQuote'}),
  defineArrayMember({type: 'pageBuilderCallout'}),
]
