import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HOME = {
  READER: "/reader/home",
  WRITER: "/writer/dashboard",
  ADMIN: "/admin/dashboard",
};

/**
 * RoleRoute — protects a route for exactly one area.
 * Signed-out visitors are sent to that area's own login (with returnTo kept);
 * a user with the wrong role is redirected to their own home and never sees
 * the guarded content.
 */
export default function RoleRoute({ area, children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/${area.toLowerCase()}/login?returnTo=${returnTo}`} replace />;
  }
  if (user.role !== area) {
    // Hard separation: each role only ever lands in its own area.
    return <Navigate to={HOME[user.role] || "/"} replace />;
  }
  return children;
}
