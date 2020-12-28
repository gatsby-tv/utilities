import React, { createContext } from "react";

interface EventHandler {
  (event: React.SyntheticEvent): void;
}

export interface ScrollContextType {
  (callback: EventHandler): void;
}

export const ScrollContext = createContext<ScrollContextType | undefined>(
  undefined
);
