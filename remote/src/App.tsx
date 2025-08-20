import { useCountStore } from "./store/useCount";
import DnD from "./DnD";
import "./global.css";

const App = () => {
  const { count, increment, decrement } = useCountStore();

  return (
    <div
      style={{
        border: "2px solid blue",
        padding: "20px",
        margin: "10px",
        borderRadius: "8px",
        backgroundColor: "#f0f8ff",
      }}
    >
      <h2>🚀 Remote Application</h2>

      {/* Zustand Counter */}
      <div style={{ marginBottom: "30px" }}>
        <h3>📊 Zustand Counter</h3>
        <p>Count: {count}</p>
        <button
          onClick={increment}
          style={{
            marginRight: "10px",
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          +
        </button>
        <button
          onClick={decrement}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          -
        </button>
      </div>

      {/* Drag & Drop Component */}
      <DnD />
    </div>
  );
};

export default App;
