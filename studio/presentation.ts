import {defineDocuments, defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([{route: '/lp/:slug', filter: `_type == "pageBuilderPage" && slug.current == $slug`}]),
  locations: {
    pageBuilderPage: defineLocations({
      select: {title: 'name', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: doc?.slug ? [{title: doc.title || 'Untitled', href: `/lp/${doc.slug}`}] : [],
      }),
    }),
  },
}
