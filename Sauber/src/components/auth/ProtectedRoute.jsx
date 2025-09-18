import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, role } = useAuthStore();

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children ? children : <Outlet />;
}




