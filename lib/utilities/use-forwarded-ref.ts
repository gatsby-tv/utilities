/* eslint-disable @typescript-eslint/no-explicit-any */

import { useLayoutEffect, useRef, Ref, RefObject } from "react";

export function useForwardedRef<T>(ref: Ref<T>): RefObject<T> {
  const inner = useRef<T>(null);

  useLayoutEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(inner.current);
    } else {
      // shh... this is our little secret...
      (ref as any).current = inner.current;
    }
  });

  return inner;
}
