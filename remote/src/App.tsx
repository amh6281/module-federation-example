import { useCountStore } from "./store/useCount";
import DnD from "./DnD";
import "./global.css";

const App = () => {
  const { count, increment, decrement } = useCountStore();

  return (
    <div className="border-2 border-blue-500 p-4 m-2 rounded-lg bg-blue-50">
      <h3 className="border hover:text-red-500 hover:border-amber-500 border-red-500">
        Hover Text
      </h3>
      <h1>helo</h1>
      <h2>🚀 Remote Application</h2>
      {/* Zustand Counter */}
      <div className="mb-7.5">
        <h3>📊 Zustand Counter</h3>
        <p>Count: {count}</p>
        <button
          onClick={increment}
          className="mr-2.5 py-2 px-4 bg-green-500 text-white border-none rounded-md cursor-pointer"
        >
          +
        </button>
        <button
          onClick={decrement}
          className="py-2 px-4 bg-red-500 text-white border-none rounded-md cursor-pointer"
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
