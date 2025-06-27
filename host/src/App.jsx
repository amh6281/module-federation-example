import React, { lazy } from "react";
import "./global.css";

const RemoteApp = lazy(() => import("remote/App"));

const App = () => {
  return (
    <div style={{ width: "100%", height: "50px", border: "1px solid red" }}>
      <RemoteApp />
    </div>
  );
};

export default App;
