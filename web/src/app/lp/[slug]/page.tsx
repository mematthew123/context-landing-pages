import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageBuilder } from "@/components/page-builder/PageBuilder";
import { urlFor } from "@/sanity/image";
import {
  getDynamicFetchOptions,
  sanityFetch,
  sanityFetchMetadata,
  sanityFetchStaticParams,
  type DynamicFetchOptions,
} from "@/sanity/live";
import { PAGE_QUERY, PAGE_SEO_QUERY, PAGE_SLUGS_QUERY } from "@/sanity/queries";

export async function generateStaticParams() {
  const { data } = await sanityFetchStaticParams({ query: PAGE_SLUGS_QUERY });
  // Cache Components needs at least one param to prerender against
  return data.length ? data.filter((page) => page.slug) : [{ slug: "__none__" }];
}

export async function generateMetadata(props: PageProps<"/lp/[slug]">): Promise<Metadata> {
  const [{ slug }, { perspective }] = await Promise.all([props.params, getDynamicFetchOptions()]);
  const { data: page } = await sanityFetchMetadata({ query: PAGE_SEO_QUERY, params: { slug }, perspective });
  if (!page) return {};

  const image = page.socialShareImage?.asset
    ? urlFor(page.socialShareImage).width(1200).height(630).fit("crop").auto("format").url()
    : undefined;

  return {
    title: page.metaTitle || page.name,
    description: page.metaDescription,
    openGraph: image ? { images: [{ url: image, width: 1200, height: 630 }] } : undefined,
  };
}

export default async function Page(props: PageProps<"/lp/[slug]">) {
  const { isEnabled: isDraftMode } = await draftMode();
  if (isDraftMode) {
    return (
      <Suspense>
        <DynamicLandingPage params={props.params} />
      </Suspense>
    );
  }
  const { slug } = await props.params;
  return <LandingPage slug={slug} perspective="published" stega={false} />;
}

async function DynamicLandingPage({ params }: Pick<PageProps<"/lp/[slug]">, "params">) {
  const [{ slug }, options] = await Promise.all([params, getDynamicFetchOptions()]);
  return <LandingPage slug={slug} {...options} />;
}

async function LandingPage({ slug, perspective, stega }: { slug: string } & DynamicFetchOptions) {
  "use cache";
  const { data: page } = await sanityFetch({ query: PAGE_QUERY, params: { slug }, perspective, stega });
  if (!page) notFound();
  return <PageBuilder page={page} />;
}
