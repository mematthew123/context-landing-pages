import { defineQuery } from "next-sanity";

export const LANDING_PAGES_QUERY = defineQuery(`
  *[_type == "landingPage" && defined(slug.current)] | order(title asc){
    _id,
    title,
    "slug": slug.current
  }
`);

export const LANDING_PAGE_QUERY = defineQuery(`
  *[_type == "landingPage" && slug.current == $slug][0]{
    _id,
    title,
    content[]{
      _key,
      _type,
      _type == "hero" => {
        heading,
        text,
        image{ asset, hotspot, crop, alt },
        link{ label, href }
      },
      _type == "features" => {
        heading,
        intro,
        items[]{ _key, title, text }
      },
      _type == "faqs" => {
        heading,
        items[]{ _key, question, answer }
      },
      _type == "callToAction" => {
        heading,
        text,
        link{ label, href }
      }
    }
  }
`);

export const LANDING_PAGE_SEO_QUERY = defineQuery(`
  *[_type == "landingPage" && slug.current == $slug][0]{
    title,
    seo{ title, description, image }
  }
`);
