import { useState, useCallback } from "react";

export interface ToggleType {
  toggle: boolean | null;
  flipToggle: () => void;
  setToggle: (value: boolean) => void;
}

export function useToggle(initial?: boolean): ToggleType {
  const [toggle, setToggle] = useState(initial ?? null);

  return {
    toggle,
    flipToggle: useCallback(() => setToggle((state) => !state), []),
    setToggle: useCallback((value: boolean) => setToggle(value), []),
  };
}
