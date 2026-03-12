import { lazy, Suspense } from "react";
import Button from "./Button";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Button />
        <RemoteApp />
      </Suspense>
    </>
  );
};

export default App;
