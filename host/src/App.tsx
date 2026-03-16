import { lazy, Suspense } from "react";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  console.log("App");
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <RemoteApp />
      </Suspense>
    </>
  );
};

export default App;
