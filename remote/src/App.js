import React from "react";
import { useCount } from "./useCount";

const App = () => {
  const { count, increment, decrement } = useCount();

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid #007bff",
        borderRadius: "8px",
        margin: "20px",
      }}
    >
      <h2>Remote App</h2>
      <p>카운터: {count}</p>
      <button onClick={increment}>증가</button>
      <button onClick={decrement} style={{ marginLeft: "10px" }}>
        감소
      </button>
    </div>
  );
};

export default App;
