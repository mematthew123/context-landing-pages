import type { BlockOf } from "./types";

type Props = BlockOf<"features">;

export function Features({ heading, intro, items }: Props) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      {heading && (
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {heading}
        </h2>
      )}
      {intro && (
        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          {intro}
        </p>
      )}
      {items && items.length > 0 && (
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item._key}>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h3>
              {item.text && (
                <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">{item.text}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
