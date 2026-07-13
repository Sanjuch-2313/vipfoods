import { Navigate } from "react-router-dom";
import { isAdminLoggedIn } from "../services/adminAuthService";

export default function ProtectedRoute({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}