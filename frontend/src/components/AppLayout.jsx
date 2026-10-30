import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setNavOpen(false), [pathname]);
  useEffect(() => {
    document.body.classList.toggle("nav-open", navOpen);
    return () => document.body.classList.remove("nav-open");
  }, [navOpen]);

  return (
    <>
      <div className="scrim" onClick={() => setNavOpen(false)} />
      <div className="app">
        <Sidebar onNavigate={() => setNavOpen(false)} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Navbar onMenu={() => setNavOpen(true)} />
          <main className="main">
            <div className="pagewrap">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
