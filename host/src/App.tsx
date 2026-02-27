import { lazy } from "react";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  console.log("Host App 렌더링됨");
  return <RemoteApp />;
};

export default App;
