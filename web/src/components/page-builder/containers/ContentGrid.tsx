import { Blocks } from "../Blocks";
import { HeadingText } from "../HeadingText";
import type { ContainerOf, HeadingLevel } from "../types";

export function ContentGrid({
  heading,
  cells,
  level,
}: ContainerOf<"pageBuilderContentGrid"> & { level: HeadingLevel }) {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20">
      <HeadingText text={heading} level={level} className="max-w-3xl" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cells?.map((cell) => (
          <div key={cell._key} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <Blocks blocks={cell.blocks} headingLevel={4} inCell />
          </div>
        ))}
      </div>
    </section>
  );
}
