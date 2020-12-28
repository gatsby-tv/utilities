import { useState, useEffect, useContext } from "react";
import Ipfs from "ipfs";
import all from "it-all";

import { IpfsContext } from "./context";

let ipfs: any = null;

const IPFS_CONFIG = {
  repo: `ipfs/gatsby/${Math.random()}`,
};

export function useIpfsInit() {
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

export function useIpfs(command: string, args: any) {
  const context = useContext(IpfsContext);
  const [result, setResult] = useState<any>(null);

  if (!context) {
    throw new Error("No IPFS context provided for component.");
  }

  useEffect(() => {
    async function callIpfs() {
      setResult(
        context?.ipfs && context?.ipfs[command]
          ? await context?.ipfs[command](args)
          : null
      );
    }

    callIpfs();
  }, [context.ipfs, command, args]);

  return result;
}

export function useIpfsContent(cid: string, contentType: string) {
  const generator = useIpfs("cat", cid);
  const [result, setResult] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function loadData() {
      const data: BlobPart[] = await all(generator);
      const blob = new Blob([...data], { type: contentType });
      setResult(window.URL.createObjectURL(blob));
    }

    generator && loadData();
  }, [generator]);

  useEffect(() => {
    return () => window.URL.revokeObjectURL(result as string);
  }, [result]);

  return result;
}
