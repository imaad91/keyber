"use client";

import { SaveIndicator } from "@/components/SaveIndicator";

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SaveIndicator />
    </>
  );
}
