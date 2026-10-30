
import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import { homeFor } from "../components/ProtectedRoute.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState("resident");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Where to go after signing in
  const destination = (u) => {
    const next = params.get("next");
    const safe = next && next.startsWith("/") && !next.startsWith("//");

    if (safe && (u.role === "admin" ? next.startsWith("/admin") : !next.startsWith("/admin"))) {
      return next;
    }

    return homeFor(u);
  };

  if (user) return <Navigate to={destination(user)} replace />;

  function switchRole(r) {
    setRole(r);
    setIdentifier("");
    setPassword("");
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    const id = identifier.trim();

    if (!id) return setError(role === "admin" ? "Enter your staff ID." : "Enter your address.");
    if (!password) return setError("Enter a password.");

    setBusy(true);
    setError("");

    try {
      const u = await login(role, id, password);
      navigate(destination(u), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const isAdmin = role === "admin";

  return (
    <AuthCard tagline="Sign in to continue">
      <div className="login-tabs">
        <button
          type="button"
          className={!isAdmin ? "is-on" : ""}
          onClick={() => switchRole("resident")}
        >
          Resident
        </button>

        <button
          type="button"
          className={isAdmin ? "is-on" : ""}
          onClick={() => switchRole("admin")}
        >
          RWA Staff
        </button>
      </div>

      {error && <p className="error-note" role="alert">{error}</p>}

      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="identifier">{isAdmin ? "Staff ID" : "Address"}</label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={isAdmin ? "RWA-04" : "B-10, Mayfield Gardens"}
            autoComplete={isAdmin ? "username" : "street-address"}
          />
        </div>

        <div className="field">
          <label htmlFor="password">{isAdmin ? "Desk password" : "Password"}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            autoComplete="current-password"
          />
        </div>

        <button
          className={`btn wide ${isAdmin ? "btn-dark" : "btn-lime"}`}
          type="submit"
          disabled={busy}
        >
          {busy ? "SIGNING IN…" : "SIGN IN"}
        </button>
      </form>

      <p className="mode-toggle">
        New here?{" "}
        <Link to="/signup" style={{ fontWeight: 800, textDecoration: "underline" }}>
          Create an account
        </Link>
      </p>

      {isAdmin && (
        <p className="muted" style={{ marginTop: "1rem", fontSize: ".8rem" }}>
          Staff accounts are created by the society administrator.
        </p>
      )}
    </AuthCard>
  );
}
