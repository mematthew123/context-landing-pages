import { stegaClean } from "next-sanity";
import { Blocks } from "../Blocks";
import type { ContainerOf, HeadingLevel } from "../types";

const backgrounds = {
  lines:
    "bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_12px)] border border-white/10",
  gradient: "bg-linear-to-br from-rose-200/20 via-violet-300/10 to-transparent border border-white/10",
  solid: "bg-white/[0.06]",
};

export function SpeedBump({
  blocks,
  background,
  level,
}: ContainerOf<"pageBuilderSpeedBump"> & { level: HeadingLevel }) {
  const bg = backgrounds[(stegaClean(background) as keyof typeof backgrounds) ?? "lines"] ?? backgrounds.lines;
  return (
    <section className="px-6 py-20">
      <div className={`mx-auto max-w-[560px] rounded-2xl p-10 text-center [&>div]:items-center ${bg}`}>
        <Blocks blocks={blocks} headingLevel={level} />
      </div>
    </section>
  );
}
