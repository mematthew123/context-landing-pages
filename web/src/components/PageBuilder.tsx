import { CallToAction } from "./blocks/CallToAction";
import { Faqs } from "./blocks/Faqs";
import { Features } from "./blocks/Features";
import { Hero } from "./blocks/Hero";
import type { Block } from "./blocks/types";

type Props = {
  title: string | null;
  content: Block[] | null;
};

export function PageBuilder({ title, content }: Props) {
  const blocks = content ?? [];
  // A leading hero carries the page's h1; otherwise the title does, visually hidden
  const heroIsFirst = blocks[0]?._type === "hero";

  return (
    <main className="flex flex-1 flex-col">
      {!heroIsFirst && <h1 className="sr-only">{title}</h1>}
      {blocks.map((block, index) => {
        switch (block._type) {
          case "hero":
            return <Hero key={block._key} {...block} level={index === 0 ? "h1" : "h2"} />;
          case "features":
            return <Features key={block._key} {...block} />;
          case "faqs":
            return <Faqs key={block._key} {...block} />;
          case "callToAction":
            return <CallToAction key={block._key} {...block} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
