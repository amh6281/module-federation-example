import { lazy, Suspense } from "react";

const ZustandApp = lazy(() => import("zustand/ZustandApp"));

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ZustandApp />
    </Suspense>
  );
};

export default App;
