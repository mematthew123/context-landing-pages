"use client";

import { useIsPresentationTool } from "next-sanity/hooks";

export function DisableDraftMode() {
  // Inside Presentation the Studio controls draft mode
  if (useIsPresentationTool()) return null;
  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed right-4 bottom-4 z-50 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 shadow-lg"
    >
      Disable draft mode
    </a>
  );
}
