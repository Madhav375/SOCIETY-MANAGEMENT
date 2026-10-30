import Brand from "./Brand.jsx";

/** Centered card used by Login and Signup. */
export default function AuthCard({ tagline, children }) {
  return (
    <main className="login-page">
      <div className="login-card">
        <Brand />
        <p className="tagline" style={{ marginTop: "1.4rem" }}>{tagline}</p>
        {children}
      </div>
    </main>
  );
}
