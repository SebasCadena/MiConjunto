import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  console.log("ProtectedRoute: user =", user);
  console.log("ProtectedRoute: loading =", loading);
  console.log("ProtectedRoute: requiredRole =", requiredRole);

  // Mostrar un mensaje de carga mientras se verifica el estado del usuario
  if (loading) return <p>Cargando...</p>;

  // Si no hay un usuario autenticado, redirigir al login
  if (!user) {
    console.error("ProtectedRoute: No user found, redirecting to login.");
    return <Navigate to="/" replace />;
  }

  // Si el rol del usuario no coincide con el requerido, redirigir al login
  if (requiredRole && (!user.role || user.role !== requiredRole)) {
    console.error(
      `ProtectedRoute: User role (${user?.role}) does not match required role (${requiredRole}). Redirecting to login.`
    );
    return <Navigate to="/" replace />;
  }

  // Pasar el userId como prop al componente hijo
  return React.cloneElement(children, { userId: user.uid });
};

export default ProtectedRoute;