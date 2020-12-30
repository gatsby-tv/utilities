/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  useState,
  useEffect,
  useCallback,
  useContext,
  useReducer,
} from "react";
import Ipfs from "ipfs";
import all from "it-all";

import { useAsync } from "@lib/utilities/use-async";

import { IpfsContext, IpfsContextType } from "./context";

let ipfs: any = null;

const IPFS_CONFIG = {
  repo: `ipfs/gatsby/${Math.random()}`,
};

export function useIpfsInit(): IpfsContextType {
  const [isReady, setIsReady] = useState(Boolean(ipfs));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadIpfs() {
      try {
        ipfs = await Ipfs.create(IPFS_CONFIG);
        const info = await ipfs.id();
        console.log(`IPFS node ready at /p2p/${info.id}`);
      } catch (error) {
        console.log(error);
        ipfs = null;
        setError(error);
      }

      setIsReady(Boolean(ipfs));
    }

    loadIpfs();

    return () => {
      if (ipfs && ipfs.stop) {
        ipfs.stop();
        ipfs = null;
        setIsReady(false);
      }
    };
  }, []);

  return { ipfs, isReady, error };
}

interface FetchAction {
  type: "fetch";
}

interface SyncAction {
  type: "sync";
  result: any;
}

type IpfsAction = FetchAction | SyncAction;

type IpfsState = {
  loading: boolean;
  result?: any;
};

export function useIpfs(
  command: string | [string],
  args?: Record<string, unknown> | string
): IpfsState {
  const context = useContext(IpfsContext);

  if (!context) {
    throw new Error("No IPFS context provided for component.");
  }

  const [state, dispatch] = useReducer(
    (state: IpfsState, action: IpfsAction) => {
      switch (action.type) {
        case "fetch":
          return state.loading ? state : { ...state, loading: true };

        case "sync":
          return {
            ...state,
            result: action.result,
            loading: false,
          };

        default:
          return state;
      }
    },
    { result: undefined, loading: false }
  );

  useAsync(
    useCallback(async () => {
      const method = [command]
        .flat()
        .reduce(
          (acc: any, key: string) => (acc ? acc[key] : undefined),
          context?.ipfs
        );
      return method ? await method(args) : undefined;
    }, [context.ipfs, command, args]),
    useCallback((result) => dispatch({ type: "sync", result }), [])
  );

  useEffect(() => dispatch({ type: "fetch" }), []);

  return state;
}

interface IpfsContentState {
  loading: boolean;
  url?: string;
}

export function useIpfsContent(
  cid: string,
  contentType: string
): IpfsContentState {
  const { result: generator } = useIpfs("cat", cid);

  const [state, dispatch] = useReducer(
    (state: IpfsContentState, action: IpfsAction) => {
      switch (action.type) {
        case "fetch":
          return state.loading ? state : { ...state, loading: true };

        case "sync":
          return {
            ...state,
            url: action.result,
            loading: false,
          };

        default:
          return state;
      }
    },
    { url: undefined, loading: false }
  );

  useAsync(
    useCallback(async () => {
      if (!generator) return;
      const data: BlobPart[] = await all(generator);
      const blob = new Blob([...data], { type: contentType });
      return window.URL.createObjectURL(blob);
    }, [generator, contentType]),
    useCallback((url) => url && dispatch({ type: "sync", result: url }), [])
  );

  useEffect(() => {
    return () => window.URL.revokeObjectURL(state.url as string);
  }, [state.url]);

  return state;
}
