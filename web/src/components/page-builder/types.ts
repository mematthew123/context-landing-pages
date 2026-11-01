import type { PAGE_QUERY_RESULT } from "../../../sanity.types";

export type Page = NonNullable<PAGE_QUERY_RESULT>;
export type Hero = NonNullable<Page["hero"]>;
export type Faq = NonNullable<Page["faq"]>;
export type Container = NonNullable<Page["containers"]>[number];
export type ContainerOf<T extends Container["_type"]> = Extract<Container, { _type: T }>;

type SectionBlock = NonNullable<ContainerOf<"pageBuilderMediaWithSection">["blocks"]>[number];
type CellBlock = NonNullable<
  NonNullable<ContainerOf<"pageBuilderContentGrid">["cells"]>[number]["blocks"]
>[number];
export type Block = SectionBlock | CellBlock;
export type BlockOf<T extends Block["_type"]> = Extract<Block, { _type: T }>;
export type Cta = NonNullable<Hero["ctas"]>[number];

export type HeadingLevel = 2 | 3 | 4;
