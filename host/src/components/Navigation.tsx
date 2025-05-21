import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav
      style={{
        backgroundColor: "#ffffff",
        padding: "1rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          gap: "1rem",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: location.pathname === "/" ? "#2563eb" : "#4b5563",
            fontWeight: location.pathname === "/" ? "600" : "400",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            transition: "all 0.2s",
          }}
        >
          Home
        </Link>
        <Link
          to="/task"
          style={{
            textDecoration: "none",
            color: location.pathname === "/task" ? "#2563eb" : "#4b5563",
            fontWeight: location.pathname === "/task" ? "600" : "400",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            transition: "all 0.2s",
          }}
        >
          Task
        </Link>
        <Link
          to="/reservation"
          style={{
            textDecoration: "none",
            color: location.pathname === "/reservation" ? "#2563eb" : "#4b5563",
            fontWeight: location.pathname === "/reservation" ? "600" : "400",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            transition: "all 0.2s",
          }}
        >
          Reservation
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
