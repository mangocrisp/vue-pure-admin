import { type Ref, type UnwrapRef, ref } from "vue";
import { isFunction, isObject } from "@/utils";
import type { AnyArray, AnyObject } from "..";

type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};

type SetState<T> = (
  params: T extends (infer U)[]
    ? U[] | ((state: UnwrapRef<U[]>) => void)
    : T extends AnyObject
      ? DeepPartial<T> | ((state: UnwrapRef<T>) => void)
      : UnwrapRef<T>
) => void;

type UseRef<T> = [Ref<UnwrapRef<T>>, SetState<T>, () => void];

export function useStateRef<T extends number>(createState: number): UseRef<T>;
export function useStateRef<T extends string>(createState: string): UseRef<T>;
export function useStateRef<T extends AnyArray>(
  createState: () => T
): UseRef<T>;
export function useStateRef<T extends AnyObject>(
  createState: () => T
): UseRef<T>;
export function useStateRef<T>(createState: any): UseRef<T> {
  const state = ref<T>(isFunction(createState) ? createState() : createState);

  const setState: SetState<T> = params => {
    if (isFunction(params)) {
      params(state.value);
    } else {
      if (isObject(state.value)) {
        Object.assign(state.value, params);
      } else {
        state.value = params as UnwrapRef<T>;
      }
    }
  };

  const resetState = () =>
    (state.value = isFunction(createState) ? createState() : createState);

  return [state as UnwrapRef<any>, setState, resetState];
}
