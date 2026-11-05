import type { Metadata } from "next";
import { defineQuery } from "next-sanity";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { readClient } from "@/sanity/write";
import { Refresh } from "./Refresh";

export const metadata: Metadata = { title: "Brief status", robots: { index: false } };

const BRIEF_STATUS_QUERY = defineQuery(`
  *[_type == "brief" && _id == $id][0]{
    title,
    status,
    "build": builds[-1]{ previewUrl, error, dropped, placeholders, gaps }
  }
`);

export default function BriefStatusPage(props: PageProps<"/brief/[id]">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-20">
      <Suspense fallback={<p className="text-white/60">Loading…</p>}>
        <BriefStatus params={props.params} />
      </Suspense>
    </main>
  );
}

async function BriefStatus({ params }: Pick<PageProps<"/brief/[id]">, "params">) {
  const { id } = await params;
  const brief = await readClient.fetch(BRIEF_STATUS_QUERY, { id });
  if (!brief) notFound();

  const done = brief.status === "done" && brief.build?.previewUrl;
  const failed = brief.status === "failed";

  return (
    <>
      {!done && !failed && <Refresh />}
      <p className="font-mono text-xs tracking-[0.2em] text-rose-200 uppercase">{brief.status ?? "queued"}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">{brief.title}</h1>

      {!done && !failed && (
        <p className="mt-4 text-white/60">Building the Draft page. This usually takes a minute or two.</p>
      )}
      {failed && <p className="mt-4 text-rose-300">The Build failed: {brief.build?.error}</p>}
      {done && (
        <>
          <a
            href={brief.build!.previewUrl!}
            className="mt-6 inline-flex rounded-md bg-rose-200 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-rose-100"
          >
            Open the Draft page
          </a>
          <Report title="Left off the page" items={brief.build?.dropped} />
          <Report title="Images needed" items={brief.build?.placeholders} />
          <Report title="Missing from the brief" items={brief.build?.gaps} />
        </>
      )}
    </>
  );
}

function Report({ title, items }: { title: string; items: string[] | null | undefined }) {
  if (!items?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-white/60">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
