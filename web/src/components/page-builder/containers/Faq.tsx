import { PortableText } from "next-sanity";
import type { Faq as FaqData } from "../types";

export function Faq({ heading, items }: FaqData) {
  if (!items?.length) return null;
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-20">
      <h2 className="text-3xl font-semibold tracking-tight text-white">{heading || "FAQ"}</h2>
      <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
        {items.map((item) => (
          <details key={item._key} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium text-white">
              <h3>{item.title}</h3>
              <span aria-hidden className="text-white/50 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="mt-4 flex flex-col gap-3 leading-7 text-white/70 [&_a]:text-rose-200 [&_a]:underline [&_strong]:text-white">
              {item.description && <PortableText value={item.description} />}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
