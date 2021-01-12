import React, { createContext } from "react";

interface EventHandler {
  (event: React.SyntheticEvent): void;
}

export interface ScrollCallback {
  (callback: EventHandler): void;
}

export type ScrollContextType = [ScrollCallback, ScrollCallback];

export const ScrollContext = createContext<ScrollContextType | undefined>(
  undefined
);
