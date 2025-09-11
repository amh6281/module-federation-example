interface CountState {
    count: number;
    increment: () => void;
    decrement: () => void;
}
export declare const useCountStore: import('zustand/traditional').UseBoundStoreWithEqualityFn<import('zustand/vanilla').StoreApi<CountState>>;
export {};
