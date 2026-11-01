import Link from "next/link";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import { getDynamicFetchOptions, sanityFetch, type DynamicFetchOptions } from "@/sanity/live";
import { PAGES_QUERY } from "@/sanity/queries";

export default async function Home() {
  const { isEnabled: isDraftMode } = await draftMode();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Landing pages</h1>
      {isDraftMode ? (
        <Suspense>
          <DynamicPageList />
        </Suspense>
      ) : (
        <PageList perspective="published" stega={false} />
      )}
    </main>
  );
}

async function DynamicPageList() {
  return <PageList {...await getDynamicFetchOptions()} />;
}

async function PageList({ perspective, stega }: DynamicFetchOptions) {
  "use cache";
  const { data: pages } = await sanityFetch({ query: PAGES_QUERY, perspective, stega });

  if (pages.length === 0) {
    return (
      <p className="mt-6 text-white/60">
        No published landing pages yet. Build one from a Brief in the Studio, then publish it.
      </p>
    );
  }

  return (
    <ul className="mt-8 divide-y divide-white/10">
      {pages.map((page) => (
        <li key={page._id}>
          <Link
            href={`/lp/${page.slug}`}
            className="flex items-baseline justify-between gap-4 py-4 text-white hover:text-white/70"
          >
            <span className="font-medium">{page.name}</span>
            <span className="text-sm text-white/40">/lp/{page.slug}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
