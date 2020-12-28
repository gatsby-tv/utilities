import { useState, useCallback } from "react";

export const useToggle = (initial?: boolean) => {
  const [toggle, setToggle] = useState(initial ?? null);

  return {
    toggle,
    flipToggle: useCallback(() => setToggle((state) => !state), []),
    setToggle: useCallback((value: boolean) => setToggle(value), []),
  };
};
