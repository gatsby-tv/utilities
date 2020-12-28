import { useContext } from "react";

import { ScrollContext } from "./context";

export const useScroll = () => {
  const scroll = useContext(ScrollContext);

  if (!scroll) {
    throw new Error("No Scroll context provided for component.");
  }

  return scroll;
};
