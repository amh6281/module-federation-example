import { lazy, Suspense, useState, useEffect } from "react";

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

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((prev) => !prev)}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        padding: "8px 16px",
        fontSize: "0.875rem",
        borderRadius: 8,
        border: "1px solid var(--border, #ddd)",
        background: "var(--bg-secondary, #f5f5f5)",
        color: "var(--text-primary, #333)",
        cursor: "pointer",
        zIndex: 9999,
      }}
    >
      {isDark ? "☀️ 라이트" : "🌙 다크"}
    </button>
  );
};

const App = () => {
  return (
    <>
      <ThemeToggle />
      <Suspense fallback={<Loader />}>
        <RemoteApp />
      </Suspense>
    </>
  );
};

export default App;
