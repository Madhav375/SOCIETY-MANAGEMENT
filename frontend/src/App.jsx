import { Link, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import Loading from "./components/Loading.jsx";
import ProtectedRoute, { homeFor } from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Complaints from "./pages/Complaints.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import NewComplaint from "./pages/NewComplaint.jsx";
import Services from "./pages/Services.jsx";
import Signup from "./pages/Signup.jsx";

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <Loading full text="Loading…" />;
  return <Navigate to={user ? homeFor(user) : "/login"} replace />;
}

function NotFound() {
  return (
    <main className="login-page">
      <div className="login-card" style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: ".6rem" }}>Page not found</h1>
        <p className="muted" style={{ marginBottom: "1.3rem" }}>That page doesn't exist.</p>
        <Link className="btn btn-lime" to="/">GO HOME</Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute role="resident" />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/new-complaint" element={<NewComplaint />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
