/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext } from "react";

export interface IpfsContextType {
  ipfs: any;
  isReady: boolean;
  error: Error | null;
}

export const IpfsContext = createContext<IpfsContextType | undefined>(
  undefined
);
