interface ReceviedListProps {
  for: "todo" | "done" | "cc";
}

interface OptionsType<T> {
  label: string;
  value: T;
}

export type { ReceviedListProps, OptionsType };
