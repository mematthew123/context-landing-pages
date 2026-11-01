import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageBuilder } from "@/components/PageBuilder";
import { urlFor } from "@/sanity/image";
import { cachedSanity } from "@/sanity/live";
import { LANDING_PAGE_QUERY, LANDING_PAGE_SEO_QUERY } from "@/sanity/queries";

export async function generateMetadata(props: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const { data: page } = await cachedSanity({
    query: LANDING_PAGE_SEO_QUERY,
    params: { slug },
    perspective: "published",
    stega: false,
  });

  if (!page) return {};

  const image = page.seo?.image?.asset
    ? urlFor(page.seo.image).width(1200).height(630).fit("crop").auto("format").url()
    : undefined;

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description,
    openGraph: image ? { images: [{ url: image, width: 1200, height: 630 }] } : undefined,
  };
}

export default function Page(props: PageProps<"/[slug]">) {
  // Landing pages are rendered on first visit and cached until their content changes
  return (
    <Suspense>
      <LandingPage params={props.params} />
    </Suspense>
  );
}

async function LandingPage({ params }: Pick<PageProps<"/[slug]">, "params">) {
  const { slug } = await params;
  const { data: page } = await cachedSanity({
    query: LANDING_PAGE_QUERY,
    params: { slug },
    perspective: "published",
    stega: false,
  });

  if (!page) notFound();

  return <PageBuilder title={page.title} content={page.content} />;
}
