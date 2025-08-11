import React from "react";

const RemoteApp = React.lazy(() => import("remote/RemoteApp"));

const App = () => {
  return (
    <div>
      <RemoteApp />
    </div>
  );
};

export default App;
