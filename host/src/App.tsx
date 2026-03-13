import { lazy, Suspense } from "react";
import Title from "./Title";
import Text from "./Text";
import Button from "./Button";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Title />
        <Text />
        <Button />
        <RemoteApp />
      </Suspense>
    </>
  );
};

export default App;
