import React, { lazy } from "react";
import "./global.css";

const RemoteApp = lazy(() => import("remote/App"));

const App = () => {
  return (
    <div style={{ width: "100%", height: "50px", border: "1px solid red" }}>
      <RemoteApp />
      <h2 className="hello">Hello World</h2>
    </div>
  );
};

export default App;
