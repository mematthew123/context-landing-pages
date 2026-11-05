import Link from "next/link";
import type { Cta } from "./types";

// Emphasis comes from position: the first CTA renders loud
export function Ctas({ ctas, className = "" }: { ctas: Cta[] | null | undefined; className?: string }) {
  if (!ctas?.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {ctas.map((cta, index) => (
        <CtaLink key={cta._key} cta={cta} loud={index === 0} />
      ))}
    </div>
  );
}

export function CtaLink({ cta, loud }: { cta: Pick<Cta, "text" | "href">; loud: boolean }) {
  if (!cta.text || !cta.href) return null;
  const className = loud
    ? "inline-flex items-center rounded-md bg-rose-200 px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-rose-100"
    : "inline-flex items-center rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/40";
  return cta.href.startsWith("/") ? (
    <Link href={cta.href} className={className}>
      {cta.text}
    </Link>
  ) : (
    <a href={cta.href} className={className}>
      {cta.text}
    </a>
  );
}
