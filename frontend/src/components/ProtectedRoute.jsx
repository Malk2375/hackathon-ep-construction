import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const location = useLocation();

  // Vérifie l'authentification et les permissions de l'utilisateur lors du montage du composant
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    if (userId) {
      setIsAuthenticated(true);
      if (allowedRoles.length === 0 || allowedRoles.includes(userRole) || userRole === 'chef_admin') {
        setHasPermission(true);
      }
    } 
    setLoading(false);
  }, [allowedRoles]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  // Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Redirige vers la page d'accès refusé si l'utilisateur n'a pas la permission requise
  if (!hasPermission) {
    return <Navigate to="/access-denied" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 