/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
  useState,
  useEffect,
  useContext,
  useReducer,
  useRef,
  RefObject,
} from "react";
import IPFS from "ipfs";
import HLS from "hls.js";
// @ts-ignore
import HLSIPFSLoader from "hlsjs-ipfs-loader";
import all from "it-all";

import { useAsync } from "@lib/utilities/use-async";

import { IPFSContext, IPFSContextType } from "./context";

let ipfs: any = undefined;

const IPFS_CONFIG = {
  repo: `ipfs/gatsby/${Math.random()}`,
};

export function useIPFSNode(): IPFSContextType {
  const [error, setError] = useState<Error | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadIPFS() {
      try {
        if (ipfs) return;
        ipfs = await IPFS.create(IPFS_CONFIG);
        HLS.DefaultConfig.loader = HLSIPFSLoader;
        const info = await ipfs.id();
        console.log(`IPFS node ready at /p2p/${info.id}`);
      } catch (error) {
        console.log(error);
        ipfs = undefined;
        setError(error);
      }

      setReady(Boolean(ipfs));
    }

    loadIPFS();

    return () => {
      if (ipfs && ipfs.stop) {
        ipfs.stop();
        ipfs = undefined;
      }
    };
  }, []);

  return { ipfs, error };
}

export function useIPFS(): IPFSContextType {
  const context = useContext(IPFSContext);

  if (!context) {
    throw new Error("No IPFS context provided for component.");
  }

  return context;
}

interface FetchAction {
  type: "fetch";
}

interface SyncAction {
  type: "sync";
  result: any;
}

type IPFSAction = FetchAction | SyncAction;

type IPFSCommandState = {
  loading: boolean;
  result?: any;
};

export function useIPFSCommand(
  command: string | [string],
  args?: Record<string, unknown> | string
): IPFSCommandState {
  const { ipfs } = useIPFS();
  const commandKey = JSON.stringify(command);

  const [state, dispatch] = useReducer(
    (state: IPFSCommandState, action: IPFSAction) => {
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
    async () => {
      if (!state.loading) return;
      const method = [JSON.parse(commandKey)]
        .flat()
        .reduce((acc: any, key: string) => (acc ? acc[key] : undefined), ipfs);
      return method ? await method(args) : undefined;
    },
    (result) => dispatch({ type: "sync", result }),
    [state.loading, ipfs, commandKey, args]
  );

  useEffect(() => dispatch({ type: "fetch" }), [ipfs]);

  return state;
}

interface IPFSContentState {
  loading: boolean;
  url?: string;
}

export function useIPFSContent(
  cid: string,
  contentType: string
): IPFSContentState {
  const { result: generator } = useIPFSCommand("cat", cid);

  const [state, dispatch] = useReducer(
    (state: IPFSContentState, action: IPFSAction) => {
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
    async () => {
      if (!generator) return;
      const data: BlobPart[] = await all(generator);
      const blob = new Blob([...data], { type: contentType });
      return window.URL.createObjectURL(blob);
    },
    (url) => dispatch({ type: "sync", result: url }),
    [generator, contentType]
  );

  useEffect(() => {
    return () => window.URL.revokeObjectURL(state.url as string);
  }, [state.url]);

  return state;
}

interface IPFSPeersState {
  loading: boolean;
  peers: Array<any>;
}

export function useIPFSPeers(): IPFSPeersState {
  const { ipfs } = useIPFS();

  const [state, dispatch] = useReducer(
    (state: IPFSPeersState, action: IPFSAction) => {
      switch (action.type) {
        case "fetch":
          return state.loading ? state : { ...state, loading: true };

        case "sync":
          return {
            ...state,
            peers: action.result,
            loading: false,
          };

        default:
          return state;
      }
    },
    { peers: [], loading: false }
  );

  useAsync(
    async () => {
      if (!state.loading || !ipfs) return;
      return await ipfs?.swarm?.peers();
    },
    (result) => dispatch({ type: "sync", result }),
    [state.loading, ipfs]
  );

  useEffect(() => {
    dispatch({ type: "fetch" });
    const id = setInterval(() => dispatch({ type: "fetch" }), 3000);
    return () => clearInterval(id);
  }, [ipfs]);

  return state;
}

export function useIPFSVideoStream(hash: string): RefObject<HTMLVideoElement> {
  const ref = useRef<HTMLVideoElement>(null);
  const { ipfs } = useIPFS();

  useEffect(() => {
    if (!ipfs || !ref.current) return;

    if (HLS.isSupported()) {
      const hls = new HLS();
      // @ts-ignore
      hls.config.ipfs = ipfs;
      // @ts-ignore
      hls.config.ipfsHash = hash;
      hls.loadSource("master.m3u8");
      hls.attachMedia(ref.current as HTMLVideoElement);
      hls.on(HLS.Events.MANIFEST_PARSED, () => ref.current?.play());
    } else {
      throw new Error("HLS is not supported.");
    }
  }, [ipfs, hash]);

  return ref;
}
