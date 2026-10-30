import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Brand from "./Brand.jsx";
import Footer from "./Footer.jsx";
import Icon from "./Icon.jsx";

const RESIDENT_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "grid" },
  { to: "/services", label: "Services", icon: "wrench" },
  { to: "/complaints", label: "Your Complaints", icon: "list" },
  { to: "/new-complaint", label: "New Complaint", icon: "plus_circle" },
];
const ADMIN_LINKS = [{ to: "/admin", label: "Admin", icon: "key" }];

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const isAdmin = user.role === "admin";
  const links = isAdmin ? ADMIN_LINKS : RESIDENT_LINKS;

  return (
    <aside className="sidebar" id="sidebar">
      <Brand to={isAdmin ? "/admin" : "/dashboard"} />
      <nav className="side-nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={onNavigate} className={({ isActive }) => (isActive ? "is-on" : "")}>
            <Icon name={l.icon} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="side-spacer" />
      <div className="user-card">
        <b>{user.name}</b>
        <small>{isAdmin ? `RWA Staff · ${user.staffId}` : `${user.address} · Resident`}</small>
        <button className="btn btn-lime wide" type="button" onClick={logout}>
          <Icon name="logout" /> LOG OUT
        </button>
      </div>
      <Footer />
    </aside>
  );
}
