import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && !user.is_superuser) {
    // Redirect to role appropriate dashboard if trying to access unauthorized route
    let redirectPath = '/landing';
    if (user.role === 'ADMIN') redirectPath = '/admin-dashboard';
    else if (user.role === 'DOCTOR') redirectPath = '/doctor-dashboard';
    else if (user.role === 'PATIENT') redirectPath = '/patient-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
