import { lazy } from "react";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  return <RemoteApp />;
};

export default App;
