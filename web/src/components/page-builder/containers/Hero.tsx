import { Ctas } from "../Ctas";
import { Eyebrow } from "../Eyebrow";
import { HeadingText } from "../HeadingText";
import type { Hero as HeroData } from "../types";

export function Hero({ eyebrow, heading, subheading, ctas }: HeroData) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      {/* Stand-in for Hex's animated backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(243,192,191,0.18),transparent_60%)]"
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-28 text-center">
        <Eyebrow text={eyebrow} />
        <HeadingText text={heading} level={1} />
        {subheading && <p className="max-w-2xl text-lg leading-8 text-pretty text-white/70">{subheading}</p>}
        <Ctas ctas={ctas} className="justify-center" />
      </div>
    </section>
  );
}
