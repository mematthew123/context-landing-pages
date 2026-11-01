import { Ctas } from "../Ctas";
import { Eyebrow } from "../Eyebrow";
import { HeadingText } from "../HeadingText";
import type { ContainerOf } from "../types";

export function SectionHeader({
  eyebrow,
  heading,
  matchedText,
  subheading,
  ctas,
}: ContainerOf<"pageBuilderSectionHeader">) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 pt-24 pb-4 text-center">
      <Eyebrow text={eyebrow} />
      <HeadingText text={heading} matchedText={matchedText} level={2} />
      {subheading && <p className="text-lg leading-8 text-pretty text-white/70">{subheading}</p>}
      <Ctas ctas={ctas} className="justify-center" />
    </section>
  );
}
