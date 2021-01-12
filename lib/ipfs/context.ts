/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext } from "react";

export interface IPFSContextType {
  ipfs: any;
  error: Error | null;
}

export const IPFSContext = createContext<IPFSContextType | undefined>(
  undefined
);
