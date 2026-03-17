import { lazy, Suspense, useEffect, useState } from "react";
import Title from "./Title";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setTitle("Title");
    }, 1000);
  }, []);

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <RemoteApp />
        <Title />
        {title}
      </Suspense>
    </>
  );
};

export default App;
