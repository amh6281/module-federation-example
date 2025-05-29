import { createWithEqualityFn } from "zustand/traditional";
import { isEqual } from "lodash-es";

interface CountState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// 초기 상태 정의
export const useCountStore = createWithEqualityFn<CountState>(
  (set) => ({
    count: 10,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  isEqual
);
