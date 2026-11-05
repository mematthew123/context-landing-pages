import { defineQuery } from "next-sanity";

const CTA = `{ _key, text, href }`;

const BLOCKS = `{
  _key,
  _type,
  _type == "pageBuilderEyebrow" => { text },
  _type == "pageBuilderHeading" => { text, matchedText },
  _type == "pageBuilderSubheading" => { text },
  _type == "pageBuilderText" => { body },
  _type == "pageBuilderChecklist" => { items },
  _type == "pageBuilderFeatureList" => { items[]{ _key, title, body } },
  _type == "pageBuilderCta" => { text, href },
  _type == "pageBuilderQuote" => { quote, highlightedText, author, authorTitle, company },
  _type == "pageBuilderCallout" => { title, body, image{ image{ asset, hotspot, crop, alt, imagePrompt }, placeholderNote } },
  _type == "pageBuilderImage" => { image{ asset, hotspot, crop, alt, imagePrompt }, placeholderNote }
}`;

export const PAGE_PROJECTION = `{
  _id,
  name,
  "slug": slug.current,
  hero{ eyebrow, heading, subheading, ctas[]${CTA} },
  containers[]{
    _key,
    _type,
    _type == "pageBuilderSectionHeader" => { eyebrow, heading, matchedText, subheading, ctas[]${CTA} },
    _type == "pageBuilderMediaWithSection" => {
      eyebrow, heading, matchedText,
      media{ asset, hotspot, crop, alt, imagePrompt },
      placeholderNote,
      blocks[]${BLOCKS}
    },
    _type == "pageBuilderContentGrid" => { heading, cells[]{ _key, blocks[]${BLOCKS} } },
    _type == "pageBuilderSpeedBump" => { background, blocks[]${BLOCKS} }
  },
  faq{ heading, items[]{ _key, title, description } }
}`;

export const PAGES_QUERY = defineQuery(`
  *[_type == "pageBuilderPage" && defined(slug.current)] | order(name asc){
    _id,
    name,
    "slug": slug.current
  }
`);

export const PAGE_SLUGS_QUERY = defineQuery(`
  *[_type == "pageBuilderPage" && defined(slug.current)]{ "slug": slug.current }
`);

export const PAGE_QUERY = defineQuery(`
  *[_type == "pageBuilderPage" && slug.current == $slug][0]${PAGE_PROJECTION}
`);

export const PAGE_SEO_QUERY = defineQuery(`
  *[_type == "pageBuilderPage" && slug.current == $slug][0]{
    name,
    metaTitle,
    metaDescription,
    socialShareImage
  }
`);

// Preview links resolve a per-Build token to that Build's Draft page
export const PREVIEW_BUILD_QUERY = defineQuery(`
  *[_type == "brief" && $previewToken in builds[].previewToken][0]{
    title,
    "build": builds[previewToken == $previewToken][0]{ pageId, startedAt }
  }
`);

export const PREVIEW_PAGE_QUERY = defineQuery(`
  *[_id == $id][0]${PAGE_PROJECTION}
`);
