import Link from "next/link";
import { cachedSanity } from "@/sanity/live";
import { LANDING_PAGES_QUERY } from "@/sanity/queries";

export default async function Home() {
  const { data: pages } = await cachedSanity({
    query: LANDING_PAGES_QUERY,
    perspective: "published",
    stega: false,
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Landing pages
      </h1>
      {pages.length > 0 ? (
        <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
          {pages.map((page) => (
            <li key={page._id}>
              <Link
                href={`/${page.slug}`}
                className="flex items-baseline justify-between gap-4 py-4 text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
              >
                <span className="font-medium">{page.title}</span>
                <span className="text-sm text-zinc-500">/{page.slug}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-zinc-600 dark:text-zinc-400">
          No published landing pages yet. Create one in the Studio and publish it.
        </p>
      )}
    </main>
  );
}
