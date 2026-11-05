import type { Metadata } from "next";
import { stegaBrand } from "next-sanity";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageBuilder } from "@/components/page-builder/PageBuilder";
import { client } from "@/sanity/client";
import { PREVIEW_BUILD_QUERY, PREVIEW_PAGE_QUERY } from "@/sanity/queries";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// A Preview link shows one Build's Draft page without a Studio login. The token is the only key.
const previewClient = client.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
  perspective: "drafts",
  stega: false,
});

export default function PreviewPage(props: PageProps<"/preview/[token]">) {
  return (
    <Suspense>
      <Preview params={props.params} />
    </Suspense>
  );
}

async function Preview({ params }: Pick<PageProps<"/preview/[token]">, "params">) {
  const { token } = await params;
  const brief = await previewClient.fetch(PREVIEW_BUILD_QUERY, { previewToken: token });
  if (!brief?.build?.pageId) notFound();

  // The drafts perspective serves a draft under its published id
  const id = brief.build.pageId.replace(/^drafts\./, "");
  const page = await previewClient.fetch(PREVIEW_PAGE_QUERY, { id });
  if (!page) notFound();

  return (
    <>
      <div className="border-b border-rose-200/30 bg-rose-200/10 px-6 py-2 text-center text-xs text-rose-100">
        Draft preview · {brief.title}
        {brief.build.startedAt && <> · built {new Date(brief.build.startedAt).toLocaleString("en-US")}</>}
      </div>
      <PageBuilder page={stegaBrand(page)} />
    </>
  );
}
