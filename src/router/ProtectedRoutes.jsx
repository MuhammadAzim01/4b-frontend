import { Navigate, Outlet } from 'react-router-dom';

import { getAuthStatus } from '../utils/auth'; 

const ProtectedRoute = ({ permission }) => {

    const { isAuthenticated, user } = getAuthStatus();
    
    // If the user is not authenticated and tries to open protected routes
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Role based access
    const hasPermission = user.role === permission;
    if (!hasPermission) {
        return <Navigate to={`/${user.role}`} replace />;
    }

    // If authenticated and has the required permission, render the protected children component
    return <Outlet/>;
};

export default ProtectedRoute;
