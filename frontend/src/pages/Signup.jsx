import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import { homeFor } from "../components/ProtectedRoute.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", address: "", phone: "", password: "", password2: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homeFor(user)} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const address = form.address.trim();
    const phone = form.phone.trim();
    if (!name) return setError("Enter your name.");
    if (!address) return setError("Enter your address.");
    if (phone && !/^[0-9+\-\s()]{6,30}$/.test(phone)) return setError("Enter a valid phone number.");
    if (form.password.length < 6) return setError("Password should be at least 6 characters.");
    if (form.password !== form.password2) return setError("Passwords don't match.");
    setBusy(true);
    setError("");
    try {
      const u = await signup({ name, address, phone, password: form.password });
      navigate(homeFor(u), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthCard tagline="Create your account">
      {error && <p className="error-note" role="alert" style={{ marginTop: "1.2rem" }}>{error}</p>}
      <form onSubmit={submit} noValidate style={{ marginTop: "1.3rem" }}>
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input type="text" id="name" value={form.name} onChange={set("name")} placeholder="Himanshi Rawal" autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="address">Address</label>
          <input type="text" id="address" value={form.address} onChange={set("address")} placeholder="B-10, Mayfield Gardens" autoComplete="street-address" />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span></label>
          <input type="tel" id="phone" value={form.phone} onChange={set("phone")} placeholder="98XXXXXXXX" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={form.password} onChange={set("password")} placeholder="••••••" autoComplete="new-password" />
        </div>
        <div className="field">
          <label htmlFor="password2">Confirm password</label>
          <input type="password" id="password2" value={form.password2} onChange={set("password2")} placeholder="••••••" autoComplete="new-password" />
        </div>
        <button className="btn btn-lime wide" type="submit" disabled={busy}>
          {busy ? "CREATING…" : "CREATE ACCOUNT"}
        </button>
      </form>
      <p className="mode-toggle">
        Already have an account? <Link to="/login" style={{ fontWeight: 800, textDecoration: "underline" }}>Sign in</Link>
      </p>
      <p className="muted" style={{ marginTop: "1rem", fontSize: ".8rem" }}>This form is for residents. RWA staff accounts are created by the society administrator.</p>
    </AuthCard>
  );
}
