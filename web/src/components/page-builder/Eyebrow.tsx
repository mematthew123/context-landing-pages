export function Eyebrow({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  return <p className="font-mono text-xs tracking-[0.2em] text-rose-200 uppercase">{text}</p>;
}
