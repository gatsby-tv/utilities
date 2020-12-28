import { useState, useEffect, useRef } from "react";

import { useSelect } from "@lib/utilities/use-select";

export interface BreakpointSet {
  [key: string]: string;
}

export function useBreakpoints(points: BreakpointSet) {
  const items = Object.keys(points);
  const queries = useRef<object>({});
  const [selection, setSelection] = useSelect(items);

  useEffect(() => {
    const handleChange = (item: string) => {
      return (query: any) => {
        if (query.matches) {
          setSelection(item);
        }
      };
    };

    queries.current = Object.fromEntries(
      items.map((item) => {
        const query = window.matchMedia(points[item]);
        const handler = handleChange(item);
        query.addEventListener("change", handler);
        handler(query);
        return [item, [query, handler]];
      })
    );

    return () => {
      Object.values(queries.current).map((query: any) =>
        query[0].removeEventListener("change", query[1])
      );
    };
  }, []);

  return Object.keys(selection).find((item) => selection[item]);
}
