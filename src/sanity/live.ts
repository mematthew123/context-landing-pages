import { defineLive, type StrictDefinedFetchType } from "next-sanity/live";
import { client } from "./client";

export const { sanityFetch, SanityLive } = defineLive({
  client,
  strict: true,
});

// The app's one shared 'use cache' boundary. `sanityFetch` tags and sets the
// cache lifetime internally; <SanityLive /> revalidates when content changes.
export const cachedSanity: StrictDefinedFetchType = async (options) => {
  "use cache";
  return sanityFetch(options);
};
