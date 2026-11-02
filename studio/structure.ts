import type {StructureResolver} from 'sanity/structure'
import {CheckmarkCircleIcon} from '@sanity/icons/CheckmarkCircle'
import {RULE_CATEGORIES} from './schemaTypes/documents/rule'

export const SINGLETON_TYPES = new Set(['rulesSyncStatus'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('brief').title('Briefs'),
      S.documentTypeListItem('pageBuilderPage').title('Landing pages'),
      S.documentTypeListItem('libraryImage').title('Image library'),
      S.divider(),
      S.listItem()
        .title('Rules')
        .icon(CheckmarkCircleIcon)
        .child(
          S.list()
            .title('Rules')
            .items([
              ...RULE_CATEGORIES.map((category) =>
                S.listItem()
                  .title(category.title)
                  .child(
                    S.documentList()
                      .title(category.title)
                      .schemaType('rule')
                      .filter('_type == "rule" && category == $category')
                      .params({category: category.value})
                      .defaultOrdering([{field: 'statement', direction: 'asc'}]),
                  ),
              ),
              S.divider(),
              S.documentTypeListItem('rule').title('All rules'),
            ]),
        ),
      S.listItem()
        .title('Rules sync status')
        .schemaType('rulesSyncStatus')
        .child(S.document().schemaType('rulesSyncStatus').documentId('rulesSyncStatus')),
      S.divider(),
      S.documentTypeListItem('frontDoorScript').title('Front-door scripts'),
    ])
