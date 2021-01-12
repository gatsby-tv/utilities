import { useContext } from "react";

import { ScrollContext, ScrollContextType } from "./context";

export function useScroll(): ScrollContextType {
  const scroll = useContext(ScrollContext);

  if (!scroll) {
    throw new Error("No Scroll context provided for component.");
  }

  return scroll;
}
