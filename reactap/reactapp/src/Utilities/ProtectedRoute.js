import React, { useEffect,useState } from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';
import { checkIfUserIsAuthenticated } from './AuthChecker'

const ProtectedRoute = () => {
    const [authenticated, setAuthenticated] = useState(null);

    useEffect(() => {
        const checkAuthentication = async () => {
            const isAuthenticated = await checkIfUserIsAuthenticated();
            //console.log(isAuthenticated);
            setAuthenticated(isAuthenticated);
        };

        checkAuthentication();
    }, []);
    if (authenticated === null) {
        // Waiting for the authentication check to complete
        return null;
    } else if (!authenticated) {
        // User is not authenticated, redirect to login page
        return <Navigate to="/login" replace />;
    } else {
        // User is authenticated, render the protected content
        return <Outlet />;
    }
};

export default ProtectedRoute;