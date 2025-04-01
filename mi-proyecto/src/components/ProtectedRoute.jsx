import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  if (!user) return <Navigate to="/" replace />;

  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
