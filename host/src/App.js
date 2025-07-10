import React from "react";
const RemoteApp = React.lazy(() => import("MicroFrontend/Remote"));

export default function App() {
  return (
    <div>
      Host App
      <RemoteApp />
    </div>
  );
}
