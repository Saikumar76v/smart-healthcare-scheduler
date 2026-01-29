import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role && userRole !== role) {
        // Redirect based on correct role if trying to access unauthorized page
        if (userRole === 'doctor') return <Navigate to="/doctor" replace />;
        if (userRole === 'patient') return <Navigate to="/patient" replace />;
        if (userRole === 'admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
