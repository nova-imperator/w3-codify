"use client";

import * as React from "react";
import { DEFAULT_PUBLIC_FLAGS, type PublicFlags } from "@/lib/flags-shared";

const FlagsContext = React.createContext<PublicFlags>(DEFAULT_PUBLIC_FLAGS);

/** Server-provided, client-safe feature flags (booleans only). */
export function FlagsProvider({
  value,
  children,
}: {
  value: PublicFlags;
  children: React.ReactNode;
}) {
  return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
}

export function useFlags(): PublicFlags {
  return React.useContext(FlagsContext);
}
