import { useRef, useEffect } from "react";

export interface AsyncMethod<T> {
  (): Promise<T>;
}

export interface AsyncCallback<T> {
  (data: T): void;
}

export function useAsync<T>(
  method: AsyncMethod<T>,
  callback: AsyncCallback<T>
): void {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    method().then((data: T) => mounted.current && callback(data));
    return () => {
      mounted.current = false;
    };
  }, [method, callback]);
}
