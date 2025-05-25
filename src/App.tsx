import { lazy } from "react";
import "@mailplug-inc/design-system/dist/assets/style.css";

const TaskApp = lazy(() => import("task/TaskApp"));

const App = () => {
  return <TaskApp />;
};

export default App;
