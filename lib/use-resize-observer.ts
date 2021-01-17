/// <reference types="resize-observer-browser" />

import { useCallback, DependencyList, RefObject } from "react";

import { useIsomorphicLayoutEffect } from "@lib/use-isomorphic-layout-effect";

export interface ResizeCallback {
  (content: ResizeObserverSize): void;
}

export function useResizeObserver<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  callback: ResizeCallback
) {
  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (let entry of entries) {
        if (entry.contentBoxSize) {
          callback(entry.contentBoxSize[0]);
        } else {
          callback({
            inlineSize: entry.contentRect.width,
            blockSize: entry.contentRect.height,
          });
        }
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);
}