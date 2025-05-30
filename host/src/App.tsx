import { lazy } from "react";

const TanstackApp = lazy(() => import("remote/TanstackApp"));

const App = () => {
  return <TanstackApp />;
};

export default App;
