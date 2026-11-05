import { PortableText } from "next-sanity";
import { CtaLink } from "./Ctas";
import { Eyebrow } from "./Eyebrow";
import { HeadingText } from "./HeadingText";
import { MediaOrPlaceholder } from "./Placeholder";
import type { Block, BlockOf, HeadingLevel } from "./types";

type Props = {
  blocks: Block[] | null | undefined;
  headingLevel: HeadingLevel;
  // Inside a Content Grid cell, a Subheading is the cell title
  inCell?: boolean;
};

export function Blocks({ blocks, headingLevel, inCell = false }: Props) {
  if (!blocks?.length) return null;
  let ctaIndex = 0;
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block) => {
        switch (block._type) {
          case "pageBuilderEyebrow":
            return <Eyebrow key={block._key} text={block.text} />;
          case "pageBuilderHeading":
            return (
              <HeadingText
                key={block._key}
                text={block.text}
                matchedText={block.matchedText}
                level={headingLevel}
              />
            );
          case "pageBuilderSubheading":
            return inCell ? (
              <h4 key={block._key} className="text-lg font-semibold text-white">
                {block.text}
              </h4>
            ) : (
              <p key={block._key} className="text-lg leading-8 text-pretty text-white/80">
                {block.text}
              </p>
            );
          case "pageBuilderText":
            return <RichText key={block._key} value={block.body} />;
          case "pageBuilderChecklist":
            return <Checklist key={block._key} items={block.items} />;
          case "pageBuilderFeatureList":
            return <FeatureList key={block._key} {...block} />;
          case "pageBuilderCta":
            return <CtaLink key={block._key} cta={block} loud={ctaIndex++ === 0} />;
          case "pageBuilderQuote":
            return <Quote key={block._key} {...block} />;
          case "pageBuilderCallout":
            return <Callout key={block._key} {...block} />;
          case "pageBuilderImage":
            return (
              <MediaOrPlaceholder
                key={block._key}
                image={block.image}
                note={block.placeholderNote}
                width={800}
                height={500}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export function RichText({ value }: { value: BlockOf<"pageBuilderText">["body"] | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-4 leading-7 text-white/70 [&_a]:text-rose-200 [&_a]:underline [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5">
      <PortableText value={value} />
    </div>
  );
}

function Checklist({ items }: { items: string[] | null }) {
  if (!items?.length) return null;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-white/80">
          <span aria-hidden className="text-rose-200">
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function FeatureList({ items }: BlockOf<"pageBuilderFeatureList">) {
  if (!items?.length) return null;
  return (
    <dl className="grid gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item._key}>
          <dt className="font-semibold text-white">{item.title}</dt>
          {item.body && <dd className="mt-1 text-sm leading-6 text-white/60">{item.body}</dd>}
        </div>
      ))}
    </dl>
  );
}

function Quote({ quote, author, authorTitle, company }: BlockOf<"pageBuilderQuote">) {
  if (!quote) return null;
  return (
    <figure className="border-l-2 border-rose-200 pl-5">
      <blockquote className="text-lg leading-8 text-white/90">“{quote}”</blockquote>
      <figcaption className="mt-3 text-sm text-white/50">
        <span className="font-medium text-white/80">{author}</span>
        {authorTitle && <>, {authorTitle}</>}
        {company && !authorTitle?.includes(company) && <> · {company}</>}
      </figcaption>
    </figure>
  );
}

function Callout({ title, body, image }: BlockOf<"pageBuilderCallout">) {
  return (
    <aside className="rounded-xl border border-white/15 p-5">
      <p className="font-semibold text-white">{title}</p>
      {body && (
        <div className="mt-2 text-sm">
          <RichText value={body} />
        </div>
      )}
      {image && (
        <div className="mt-4">
          <MediaOrPlaceholder image={image.image} note={image.placeholderNote} width={800} height={450} />
        </div>
      )}
    </aside>
  );
}
