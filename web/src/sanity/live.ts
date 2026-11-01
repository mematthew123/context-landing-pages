import type { QueryParams } from "next-sanity";
import { defineLive, resolvePerspectiveFromCookies, type LivePerspective } from "next-sanity/live";
import { cookies, draftMode } from "next/headers";
import { client } from "./client";

const token = process.env.SANITY_API_READ_TOKEN;
if (!token) {
  throw new Error("Missing SANITY_API_READ_TOKEN");
}

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  // Exposed to browsers in draft mode, so it must be a Viewer token
  browserToken: token,
  strict: true,
});

export type DynamicFetchOptions = {
  perspective: LivePerspective;
  stega: boolean;
};

// Request-time values can't be read inside 'use cache', so resolve them here and pass them in
export async function getDynamicFetchOptions(): Promise<DynamicFetchOptions> {
  const { isEnabled: isDraftMode } = await draftMode();
  if (!isDraftMode) return { perspective: "published", stega: false };

  const perspective = await resolvePerspectiveFromCookies({ cookies: await cookies() });
  return { perspective: perspective ?? "drafts", stega: true };
}

export async function sanityFetchStaticParams<const QueryString extends string>({
  query,
  params = {},
}: {
  query: QueryString;
  params?: QueryParams;
}) {
  "use cache";
  return sanityFetch({ query, params, perspective: "published", stega: false });
}

export async function sanityFetchMetadata<const QueryString extends string>({
  query,
  params = {},
  perspective,
}: {
  query: QueryString;
  params?: QueryParams;
  perspective: LivePerspective;
}) {
  "use cache";
  return sanityFetch({ query, params, perspective, stega: false });
}
