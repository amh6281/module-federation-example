import React from "react";
import { useCount } from "host/useCount";

const App = () => {
  const { count } = useCount();

  return (
    <div>
      <h1>Count: {count}</h1>
    </div>
  );
};

export default App;
