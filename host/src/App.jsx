import { lazy } from "react";

const ZustandApp = lazy(() => import("zustand/ZustandApp"));

const App = () => {
  return <ZustandApp />;
};

export default App;
