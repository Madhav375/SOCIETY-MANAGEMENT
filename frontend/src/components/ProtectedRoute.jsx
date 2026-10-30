import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loading from "./Loading.jsx";

/**
 * Guards a group of routes.
 *  - not signed in      -> /login?next=<current path>
 *  - wrong role         -> that user's own home page (residents never reach /admin)
 */
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading full text="Checking your session…" />;
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

export const homeFor = (user) => (user.role === "admin" ? "/admin" : "/dashboard");
