import { useRef } from "react";

interface IdGenerator {
  (): string;
}

const newIdGenerator = (prefix: string): IdGenerator => {
  let index = 0;
  return () => `${prefix}-${index++}`;
};

const globalIdGeneratorsFactory = () => {
  let generators: Record<string, IdGenerator> = {};
  return (prefix: string) => {
    if (!generators[prefix]) {
      generators = { ...generators, [prefix]: newIdGenerator(prefix) };
    }
    return generators[prefix];
  };
};

const useGlobalIdGenerator = globalIdGeneratorsFactory();

export const useUniqueId = (prefix: string) => {
  const generator = useGlobalIdGenerator(prefix);
  const id = useRef<string | null>(null);

  if (!id.current) {
    id.current = generator();
  }

  return id.current;
};
