import { lazy, Suspense } from "react";
import "./index.css";
// const RemoteApp = lazy(() => import("remote/RemoteApp"));

const App = () => {
  return (
    <div>
      <h1 className="bg-red-500">Host Application</h1>

      {/* <Suspense fallback={<div>Loading Remote App...</div>}>
        <RemoteApp />
      </Suspense> */}
    </div>
  );
};

export default App;
