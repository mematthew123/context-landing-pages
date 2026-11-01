import type { BlockOf } from "./types";

type Props = BlockOf<"faqs">;

export function Faqs({ heading, items }: Props) {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      {heading && (
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {heading}
        </h2>
      )}
      {items && items.length > 0 && (
        <div className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((item) => (
            <details key={item._key} className="group py-5">
              <summary className="cursor-pointer list-none font-medium text-zinc-900 dark:text-zinc-50">
                {item.question}
              </summary>
              <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">{item.answer}</p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
