import "./App.css";
import { useCountStore } from "./store/count";

function App() {
  const count = useCountStore((state) => state.count);

  return (
    <>
      <h2>helo</h2>
      <span>{count}</span>
    </>
  );
}

export default App;
