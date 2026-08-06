"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface ExpandedData {
  title: string;
  body: string;
  sourceSection?: string;
}

interface ExpandedContextValue {
  expandedData: ExpandedData | null;
  expand: (data: ExpandedData) => void;
  close: () => void;
}

const ExpandedContext = createContext<ExpandedContextValue | null>(null);

export function ExpandedProvider({ children }: { children: ReactNode }) {
  const [expandedData, setExpandedData] = useState<ExpandedData | null>(null);

  const expand = useCallback((data: ExpandedData) => setExpandedData(data), []);
  const close = useCallback(() => setExpandedData(null), []);

  return (
    <ExpandedContext.Provider value={{ expandedData, expand, close }}>
      {children}
    </ExpandedContext.Provider>
  );
}

export function useExpanded() {
  const ctx = useContext(ExpandedContext);
  if (!ctx) throw new Error("useExpanded must be used within ExpandedProvider");
  return ctx;
}
