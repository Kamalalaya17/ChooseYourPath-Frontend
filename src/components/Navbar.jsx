import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LINKS = {
  READER: [
    { to: "/reader/home", label: "Home" },
    { to: "/reader/library", label: "Library" },
    { to: "/reader/stories", label: "Stories" },
    { to: "/reader/favorites", label: "Favorites" },
    { to: "/reader/history", label: "History" },
    { to: "/reader/profile", label: "Profile" },
  ],
  WRITER: [
    { to: "/writer/dashboard", label: "Dashboard" },
    { to: "/writer/stories", label: "My Stories" },
    { to: "/writer/create", label: "Create Story" },
    { to: "/writer/profile", label: "Profile" },
  ],
  ADMIN: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/stories", label: "Stories" },
    { to: "/admin/comments", label: "Comments" },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/settings", label: "Settings" },
  ],
};

export default function Navbar({ area }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = LINKS[area] || [];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate(`/${(area || "READER").toLowerCase()}/login`);
    }
  };

  return (
    <nav className="cyp-nav">
      <div className="cyp-nav-inner">
        <Link
          to="/"
          className="cyp-brand"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}
        >
          <img
            src="/logo.png"
            alt="ChooseYourPath logo"
            width="28"
            height="28"
            style={{
              display: "block",
              width: "28px",
              height: "28px",
              minWidth: "28px",
              minHeight: "28px",
              maxWidth: "28px",
              maxHeight: "28px",
              objectFit: "contain",
              flex: "0 0 28px",
              flexShrink: 0,
            }}
          />

          <span>ChooseYourPath</span>
        </Link>

        <div className="cyp-nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `cyp-nav-link${isActive ? " active" : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="cyp-nav-right">
          <span className={`cyp-role-chip cyp-role-${user?.role}`}>
            {user?.role}
          </span>

          <span className="cyp-nav-user">{user?.username}</span>

          <button
            type="button"
            className="cyp-btn cyp-btn-ghost cyp-btn-sm"
            onClick={handleLogout}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}