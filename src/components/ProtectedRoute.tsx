
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated but role check is needed
  if (allowedRoles && allowedRoles.length > 0) {
    // If user role isn't loaded yet, show loading
    if (!userRole) {
      return <div className="flex items-center justify-center min-h-screen">Loading permissions...</div>;
    }
    
    // Check if user has required role
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // User is authenticated and has correct role
  return <>{children}</>;
};

export default ProtectedRoute;
