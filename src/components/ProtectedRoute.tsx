import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

function ProtectedRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) { return <p>Loading...</p>; }
    if (!isAuthenticated) { return <Navigate to="/login" replace />; }
    return <>{children}</>
}

export default ProtectedRoute;