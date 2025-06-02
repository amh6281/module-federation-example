// import { create } from "zustand";
import { createWithEqualityFn } from "zustand/traditional";

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const useCountStore = createWithEqualityFn(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  deepEqual
);
