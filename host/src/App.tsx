import { lazy, Suspense, useState, useEffect } from "react";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  return (
    <>
      <ThemeToggle />
      <Suspense fallback={<Loader />}>
        <RemoteApp />
      </Suspense>
    </>
  );
};

export default App;
