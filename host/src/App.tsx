import { lazy, Suspense, useState, useEffect } from "react";

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
