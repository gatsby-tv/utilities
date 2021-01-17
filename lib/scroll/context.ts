import React, { createContext, MutableRefObject } from "react";

interface EventHandler {
  (event: React.SyntheticEvent): void;
}

export interface ScrollCallback {
  (callback: EventHandler): void;
}

export type ScrollContextType = {
  scrollPosition: MutableRefObject<number>;
  setScrollPosition: (position: number) => void;
  addScrollListener: ScrollCallback;
  removeScrollListener: ScrollCallback;
};

export const ScrollContext = createContext<ScrollContextType | undefined>(
  undefined
);
