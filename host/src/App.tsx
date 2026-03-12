import { lazy, Suspense } from "react";
import Button from "./Button";
import Title from "./Title";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Title />
        <Button />
        <RemoteApp />
      </Suspense>
    </>
  );
};

export default App;
