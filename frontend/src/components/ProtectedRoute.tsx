import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Spin } from "utils/antd.tsx";
import type { Role } from "types/employee.ts";
import toast from "react-hot-toast";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const hasRequiredRole = user?.roles?.some(role => allowedRoles.includes(role as Role));

  if (!hasRequiredRole) {
    if (user) toast.error("You are not authorized for this action.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
