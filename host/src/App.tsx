import { lazy, Suspense } from "react";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <RemoteApp />
      </Suspense>
    </>
  );
};

export default App;
