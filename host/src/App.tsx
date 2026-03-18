import { lazy, Suspense } from "react";
import Title from "./Title";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Title title="Remote App" />
        <RemoteApp />
      </Suspense>
    </>
  );
};

export default App;
