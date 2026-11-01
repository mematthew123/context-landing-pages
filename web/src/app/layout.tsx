import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { SanityLive } from "@/sanity/live";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif", weight: "400", style: "italic", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Context Landing Pages",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { isEnabled: isDraftMode } = await draftMode();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${serif.variable} h-full bg-zinc-950 antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <SanityLive includeDrafts={isDraftMode} />
        {isDraftMode && (
          <>
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
      </body>
    </html>
  );
}
