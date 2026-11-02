import type { Metadata } from "next";
import { BriefForm } from "./BriefForm";

export const metadata: Metadata = { title: "Submit a brief", robots: { index: false } };

export default function BriefPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Submit a brief</h1>
      <p className="mt-3 text-white/60">
        We build a Draft landing page from it and send you a preview link. Nothing is published until someone reviews it in
        the Studio.
      </p>
      <BriefForm />
    </main>
  );
}
