const App = () => {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ marginBottom: "1rem", color: "#1f2937" }}>
        Welcome to Task
      </h1>
      <p style={{ color: "#4b5563", lineHeight: "1.6" }}>
        This is the Task page of our micro-frontend application.
      </p>
    </div>
  );
};

export default App;
