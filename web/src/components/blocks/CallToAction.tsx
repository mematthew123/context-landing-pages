import { SanityLink, buttonClassName } from "../SanityLink";
import type { BlockOf } from "./types";

type Props = BlockOf<"callToAction">;

export function CallToAction({ heading, text, link }: Props) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="flex flex-col items-start gap-6 rounded-2xl bg-zinc-100 p-10 dark:bg-zinc-900">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {heading}
        </h2>
        {text && (
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">{text}</p>
        )}
        <SanityLink link={link} className={buttonClassName} />
      </div>
    </section>
  );
}
