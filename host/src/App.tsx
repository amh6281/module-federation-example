import { lazy } from "react";

const Button = lazy(() => import("remote/Button"));

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
      <span style={{ fontSize: "20px", fontWeight: "bold" }}>
        Remote Button
      </span>
      <Button />
    </div>
  );
};

export default App;
