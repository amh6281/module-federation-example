import React, { lazy, Suspense } from "react";
import { useCount } from "./count";

const RemoteApp = lazy(() => import("remote/App"));

const App = () => {
  const { count, increment } = useCount();
  return (
    <div className="text-3xl mx-auto max-w-6xl">
      <div>Name: host</div>
      <div>Count: {count}</div>
      <div>
        <button
          onClick={increment}
          className="bg-indigo-800 text-white font-bold py-2 px-4 rounded"
        >
          Add To Cart
        </button>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <RemoteApp />
      </Suspense>
    </div>
  );
};

export default App;
