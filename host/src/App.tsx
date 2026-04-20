import { lazy, Suspense } from "react";
import Title from "./Title";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  console.log("App");
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
