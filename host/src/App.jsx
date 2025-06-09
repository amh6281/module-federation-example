import { lazy, Suspense } from "react";
// import { useCount } from "zustand/useCount";

const ZustandApp = lazy(() => import("zustand/ZustandApp"));

const App = () => {
  // const { count, increment, decrement } = useCount();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ZustandApp />
      {/* <div>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
        <p>Count: {count}</p>
      </div> */}
    </Suspense>
  );
};

export default App;
