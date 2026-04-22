import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: any) => {
  const isAuth = localStorage.getItem("adminAuth") === "true";

  if (!isAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};