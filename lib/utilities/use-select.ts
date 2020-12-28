import { useState, useCallback } from "react";

export interface SelectionState {
  [key: string]: boolean;
}

export interface SelectionCallback {
  (id?: string): void;
}

export function useSelect(items: string[], initial?: string) {
  const fresh = Object.fromEntries(items.map((id) => [id, false]));
  const [state, setState] = useState<SelectionState>(
    initial ? { ...fresh, [initial]: true } : fresh
  );
  const setSelection = useCallback((id?: string) => {
    setState(id ? { ...fresh, [id as string]: true } : fresh);
  }, []);

  return [state, setSelection] as [SelectionState, SelectionCallback];
}
