import React from "react";

const ZustandApp = React.lazy(() => import("zustand/ZustandApp"));

const App = () => {
  return (
    <div>
      <ZustandApp />
    </div>
  );
};

export default App;
