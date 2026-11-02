"use client";

import { useActionState } from "react";
import { submitBrief, type BriefFormState } from "./actions";

const field =
  "w-full rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-white placeholder:text-white/30 focus:border-rose-200 focus:outline-none";

export function BriefForm() {
  const [state, action, pending] = useActionState<BriefFormState, FormData>(submitBrief, {});
  return (
    <form action={action} className="mt-10 flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-white">Page name</span>
        <input name="title" required placeholder="Solutions — Data leaders" className={field} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-white">Your name</span>
        <input name="submittedBy" required className={field} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-white">Brief document</span>
        <input
          name="document"
          type="file"
          accept=".pdf,.docx,.md,.markdown,.txt"
          className="text-sm text-white/70 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white"
        />
        <span className="text-xs text-white/40">PDF, DOCX, Markdown, or text, up to 10 MB.</span>
      </label>
      <div className="flex items-center gap-4 text-xs tracking-[0.2em] text-white/30 uppercase">
        <span className="h-px flex-1 bg-white/10" />
        or paste it
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <label className="flex flex-col gap-2">
        <span className="sr-only">Brief text</span>
        <textarea name="text" rows={12} placeholder="Goal, audience, key message, proof points, CTAs…" className={field} />
      </label>
      {state.error && <p className="text-sm text-rose-300">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-rose-200 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-rose-100 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Build the page"}
      </button>
    </form>
  );
}
