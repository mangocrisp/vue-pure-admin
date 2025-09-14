interface ReceviedListProps {
  for: "todo" | "done" | "cc";
}

interface optionsType<T> {
  label: string;
  value: T;
}

export type { ReceviedListProps, optionsType };
