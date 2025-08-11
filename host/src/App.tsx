import { lazy } from "react";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "200px",
      }}
    >
      <RemoteApp />
    </div>
  );
};

export default App;
