"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Re-render the server component until the Build finishes
export function Refresh({ every = 5000 }: { every?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), every);
    return () => clearInterval(timer);
  }, [router, every]);
  return null;
}
