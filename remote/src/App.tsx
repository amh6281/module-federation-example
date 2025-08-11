import { useCountStore } from "./store/useCount";

const App = () => {
  const { count, increment, decrement } = useCountStore();

  return (
    <div>
      <div>Remote</div>
      <div>{count}</div>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};

export default App;
