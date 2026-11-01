import {defineArrayMember, defineType} from 'sanity'

export const pageBuilder = defineType({
  name: 'pageBuilder',
  type: 'array',
  of: [
    defineArrayMember({type: 'hero'}),
    defineArrayMember({type: 'features'}),
    defineArrayMember({type: 'faqs'}),
    defineArrayMember({type: 'callToAction'}),
  ],
})
