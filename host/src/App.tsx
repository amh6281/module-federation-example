import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";

const TaskApp = lazy(() => import("task/TaskApp"));

const Home = () => (
  <div
    style={{
      backgroundColor: "#ffffff",
      padding: "2rem",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}
  >
    <h1 style={{ marginBottom: "1rem", color: "#1f2937" }}>Welcome to Home</h1>
    <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
      This is the home page of our micro-frontend application.
    </p>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Navigation />
        <main
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1rem",
          }}
        >
          {/* <TwoButtonComponent /> */}
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "200px",
                }}
              >
                Loading...
              </div>
            }
          >
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Home />
                  </>
                }
              />
              <Route
                path="/task"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <TaskApp />
                  </Suspense>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
