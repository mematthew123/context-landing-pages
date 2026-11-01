import Link from "next/link";

type Props = {
  link: { label: string | null; href: string | null } | null;
  className?: string;
};

export function SanityLink({ link, className }: Props) {
  if (!link?.href || !link.label) return null;

  if (link.href.startsWith("/")) {
    return (
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    );
  }

  return (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  );
}

export const buttonClassName =
  "inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200";
