import { ContentGrid } from "./containers/ContentGrid";
import { Faq } from "./containers/Faq";
import { Hero } from "./containers/Hero";
import { MediaWithSection } from "./containers/MediaWithSection";
import { SectionHeader } from "./containers/SectionHeader";
import { SpeedBump } from "./containers/SpeedBump";
import type { HeadingLevel, Page } from "./types";

export function PageBuilder({ page }: { page: Page }) {
  // A Section Header demotes the headings of the containers after it, up to the next one
  let level: HeadingLevel = 2;
  let mediaIndex = 0;

  return (
    <main className="flex flex-1 flex-col bg-zinc-950 text-white">
      {page.hero ? <Hero {...page.hero} /> : <h1 className="sr-only">{page.name}</h1>}
      {page.containers?.map((container) => {
        switch (container._type) {
          case "pageBuilderSectionHeader":
            level = 3;
            return <SectionHeader key={container._key} {...container} />;
          case "pageBuilderMediaWithSection":
            return (
              <MediaWithSection
                key={container._key}
                {...container}
                level={level}
                mediaRight={mediaIndex++ % 2 === 1}
              />
            );
          case "pageBuilderContentGrid":
            return <ContentGrid key={container._key} {...container} level={level} />;
          case "pageBuilderSpeedBump":
            return <SpeedBump key={container._key} {...container} level={level} />;
          default:
            return null;
        }
      })}
      {page.faq && <Faq {...page.faq} />}
    </main>
  );
}
