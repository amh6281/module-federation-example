import React from "react";
import { useCount } from "./store/useCount";

const App = () => {
  const { count, increment, decrement } = useCount();

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};

export default App;
