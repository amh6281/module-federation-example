import React from "react";
import { lazy, Suspense } from "react";
import { Link, BrowserRouter, Routes, Route } from "react-router-dom";
import { useCount } from "remote/useCount";

const RemoteApp = lazy(() => import("remote/App"));

const App = () => {
  const { count, increment, decrement } = useCount();
  console.log(count);
  return (
    <BrowserRouter>
      <div>
        <Link to="/">Home</Link>
        <Link style={{ marginLeft: "30px" }} to="/remote">
          remote
        </Link>
        <Routes>
          <Route path="/" element={<div>{count}</div>} />
          <Route path="/remote" element={<RemoteApp />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
