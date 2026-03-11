import { lazy, Suspense } from "react";

const RemoteApp = lazy(() => import("remote/RemoteApp"));

const Loader = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      fontSize: "1.25rem",
      color: "var(--text-secondary, #666)",
    }}
  >
    로딩 중...
  </div>
);

const App = () => {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <RemoteApp />
      </Suspense>
    </>
  );
};

export default App;
