import { Navigate, Outlet } from "react-router-dom";
import { getUserRole } from "../utils/auth";

type Props = {
  allowedRoles?: string[];
};

export default function ProtectedRoute({ allowedRoles }: Props) {
  const token = localStorage.getItem("accessToken");
  const role = getUserRole();

  if (!token) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(role ?? "")) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}