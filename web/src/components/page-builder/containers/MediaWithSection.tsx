import { Blocks } from "../Blocks";
import { Eyebrow } from "../Eyebrow";
import { HeadingText } from "../HeadingText";
import { MediaOrPlaceholder } from "../Placeholder";
import type { ContainerOf, HeadingLevel } from "../types";

type Props = ContainerOf<"pageBuilderMediaWithSection"> & {
  level: HeadingLevel;
  mediaRight: boolean;
};

export function MediaWithSection({
  eyebrow,
  heading,
  matchedText,
  media,
  placeholderNote,
  blocks,
  level,
  mediaRight,
}: Props) {
  const blockLevel = (heading ? Math.min(level + 1, 4) : level) as HeadingLevel;
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20">
      {(eyebrow || heading) && (
        <div className="flex max-w-3xl flex-col gap-4">
          <Eyebrow text={eyebrow} />
          <HeadingText text={heading} matchedText={matchedText} level={level} />
        </div>
      )}
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className={mediaRight ? "md:order-2" : undefined}>
          <MediaOrPlaceholder image={media} note={placeholderNote} width={1200} height={750} />
        </div>
        <Blocks blocks={blocks} headingLevel={blockLevel} />
      </div>
    </section>
  );
}
