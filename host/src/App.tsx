import { lazy, Suspense, useState } from "react";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <button onClick={handleClick}>Click me</button>
        <RemoteApp />
      </Suspense>
    </>
  );
};

export default App;
