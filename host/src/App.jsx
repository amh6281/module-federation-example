import { lazy, Suspense } from "react";

const ZustandApp = lazy(() => import("zustand/ZustandApp"));
const useCount = () => lazy(() => import("zustand/useCount"));
const App = () => {
  const { count, increment, decrement } = useCount();
  console.log(count);
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
