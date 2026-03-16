import { lazy, Suspense } from "react";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  return (
    <>
      <Suspense>
        <RemoteApp />
      </Suspense>
    </>
  );
};

export default App;
