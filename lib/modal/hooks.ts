/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useEffect, useCallback, DependencyList } from "react";

import { ModalContext } from "./context";

export interface ModalCallback {
  (event: any): void;
}

export function useModal(callback: ModalCallback, deps: DependencyList): void {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("No Modal context provided for component.");
  }

  const [addModalCallback, removeModalCallback] = context;

  const _callback = useCallback(callback, deps);

  useEffect(() => {
    addModalCallback(_callback);
    return () => removeModalCallback(_callback);
  }, [addModalCallback, _callback]);
}
