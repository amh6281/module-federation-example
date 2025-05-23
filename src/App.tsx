import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "http://localhost:4173/task-element.js";

    script.type = "text/javascript";
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      host app
      <app-task />
    </div>
  );
};

export default App;
