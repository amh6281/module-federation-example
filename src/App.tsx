import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "@mailplug-inc/design-system/dist/assets/style.css";
import { Gnb, Header } from "@mailplug-inc/design-system";
import { useEffect, useRef } from "react";

const TaskPage = () => {
  return (
    <iframe
      src="http://localhost:5000"
      style={{
        width: "100%",
        height: "100vh",
      }}
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      title="MyTask Application"
    />
  );
};

const ReservationPage = () => {
  return (
    <iframe
      src="http://localhost:5001"
      style={{
        width: "100%",
        height: "100vh",
      }}
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      title="MyTask Application"
    />
  );
};

const HomePage = () => {
  return (
    <div>
      <h1>Host App</h1>
      <Link to="/task">Task</Link>
    </div>
  );
};

const App = () => {
  const taskRef = useRef<HTMLIFrameElement>(null);
  const isTask = window.location.pathname.includes("task");

  useEffect(() => {
    const data = { userId: "test", token: "abc123" };
    if (taskRef.current) {
      taskRef.current.contentWindow?.postMessage(data, "http://localhost:5000");
    }
  }, [isTask]);

  return (
    <BrowserRouter>
      <Header defaultConfig={defaultConfig} />
      <div
        id="body"
        className={`layout_skin__${defaultConfig.skin.skinRGB} flex h-[calc(100vh-60px)]`}
      >
        <Gnb />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/task"
            element={
              <iframe
                ref={taskRef}
                src="http://localhost:5000"
                style={{
                  width: "100%",
                  height: "100vh",
                }}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title="MyTask Application"
              />
            }
          />
          <Route path="/reservation" element={<ReservationPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
