import Image from "next/image";
import { urlFor } from "@/sanity/image";

type SanityImage = {
  asset?: { _ref: string } | null;
  hotspot?: unknown;
  crop?: unknown;
  alt?: string | null;
  imagePrompt?: string | null;
} | null;

// A media slot the Build left empty renders as Hex's placeholder color until someone fills it
export function MediaOrPlaceholder({
  image,
  note,
  width,
  height,
}: {
  image: SanityImage | undefined;
  note?: string | null;
  width: number;
  height: number;
}) {
  if (image?.asset) {
    return (
      <Image
        src={urlFor(image).width(width).height(height).fit("crop").auto("format").url()}
        alt={image.alt ?? ""}
        width={width}
        height={height}
        className="w-full rounded-xl border border-white/10 object-cover"
      />
    );
  }
  return (
    <div
      className="flex w-full items-center justify-center rounded-xl bg-[#F3C0BF] p-6 text-center text-sm font-medium text-zinc-900"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <span>
        {image?.imagePrompt ? "Generating image…" : "Image needed"}
        {note && <span className="mt-1 block font-normal text-zinc-700">{note}</span>}
      </span>
    </div>
  );
}
