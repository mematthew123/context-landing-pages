import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { SanityLink, buttonClassName } from "../SanityLink";
import type { BlockOf, HeadingLevel } from "./types";

type Props = BlockOf<"hero"> & { level: HeadingLevel };

export function Hero({ heading, text, image, link, level }: Props) {
  const Heading = level;

  return (
    <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 py-20 md:grid-cols-2">
      <div className="flex flex-col items-start gap-6">
        <Heading className="text-4xl font-semibold tracking-tight text-balance text-zinc-900 sm:text-5xl dark:text-zinc-50">
          {heading}
        </Heading>
        {text && (
          <p className="text-lg leading-8 text-pretty text-zinc-600 dark:text-zinc-400">
            {text}
          </p>
        )}
        <SanityLink link={link} className={buttonClassName} />
      </div>
      {image?.asset && (
        <Image
          src={urlFor(image).width(1200).height(900).fit("crop").auto("format").url()}
          alt={image.alt ?? ""}
          width={1200}
          height={900}
          priority={level === "h1"}
          className="aspect-4/3 w-full rounded-2xl object-cover"
        />
      )}
    </section>
  );
}
