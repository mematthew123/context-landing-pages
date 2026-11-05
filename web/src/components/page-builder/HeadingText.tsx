import { stegaClean } from "next-sanity";

type Props = {
  text: string | null;
  matchedText?: string | null;
  level: 1 | 2 | 3 | 4;
  className?: string;
};

const sizes = {
  1: "text-4xl sm:text-6xl",
  2: "text-3xl sm:text-5xl",
  3: "text-2xl sm:text-3xl",
  4: "text-xl sm:text-2xl",
};

// Gradient heading with an italic display-text suffix, as on hex.tech
export function HeadingText({ text, matchedText, level, className = "" }: Props) {
  if (!text) return null;
  const Tag = `h${level}` as const;
  const clean = stegaClean(text);
  const suffix = matchedText ? stegaClean(matchedText) : "";
  const split = suffix && clean.endsWith(suffix) ? clean.length - suffix.length : -1;

  return (
    <Tag
      className={`bg-linear-to-b from-white to-white/60 bg-clip-text font-semibold tracking-tight text-balance text-transparent ${sizes[level]} ${className}`}
    >
      {split > 0 ? (
        <>
          {clean.slice(0, split)}
          <em className="font-serif font-normal italic">{clean.slice(split)}</em>
        </>
      ) : (
        text
      )}
    </Tag>
  );
}
