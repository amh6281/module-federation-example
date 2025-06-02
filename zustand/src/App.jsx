import { useCountStore } from "./store/useCount";

const App = () => {
  const { count, increment, decrement } = useCountStore();
  return (
    <div>
      <h1>zustand</h1>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

export default App;
