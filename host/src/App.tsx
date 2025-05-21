import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./components/Home";
import "@mailplug-inc/design-system/dist/assets/style.css";
import { Gnb, Header } from "@mailplug-inc/design-system";
import ErrorBoundary from "./components/ErrorBoundary";

const TaskApp = lazy(() => import("task/TaskApp"));
const ReserveButton = lazy(() => import("reserve/ReserveButton"));
const ReserveNumberCircle = lazy(() => import("reserve/ReserveNumberCircle"));
const ReserveTwoButton = lazy(() => import("reserve/ReserveTwoButton"));

const App = () => {
  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: "100vh",
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
          <ErrorBoundary>
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
                    <ErrorBoundary>
                      <Home />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/task"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <TaskApp text="from host" />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/reservation"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<div>Loading...</div>}>
                        <ReserveButton />
                        <ReserveNumberCircle />
                        <ReserveTwoButton onConfirm={() => alert("confirm")} />
                      </Suspense>
                    </ErrorBoundary>
                  }
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
