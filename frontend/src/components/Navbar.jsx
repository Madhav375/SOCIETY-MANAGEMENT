import Brand from "./Brand.jsx";
import Icon from "./Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/** Top bar shown on mobile widths only (CSS hides it on desktop). */
export default function Navbar({ onMenu }) {
  const { user } = useAuth();
  return (
    <div className="mobile-bar">
      <Brand to={user.role === "admin" ? "/admin" : "/dashboard"} />
      <button className="menu-btn" type="button" aria-label="Open menu" onClick={onMenu}>
        <Icon name="menu" strokeWidth={2} />
      </button>
    </div>
  );
}
