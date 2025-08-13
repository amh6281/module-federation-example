import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// React 19 + Module Federation 호환성을 위한 안전한 렌더링
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  // StrictMode 제거로 Module Federation 충돌 방지
  root.render(<App />);
}
