import type { LANDING_PAGE_QUERY_RESULT } from "../../../sanity.types";

export type Block = NonNullable<
  NonNullable<LANDING_PAGE_QUERY_RESULT>["content"]
>[number];

export type BlockOf<T extends Block["_type"]> = Extract<Block, { _type: T }>;

export type HeadingLevel = "h1" | "h2";
