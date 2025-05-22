import { lazy } from "react";

import "@mailplug-inc/design-system/dist/assets/style.css";

const TwoButton = lazy(() => import("task/TwoButton"));

const App = () => {
  return (
    <div>
      <h1>Host App</h1>
      <TwoButton />
    </div>
  );
};

export default App;
