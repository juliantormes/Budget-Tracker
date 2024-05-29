import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const { user } = useAuth();
  return user ? <Component {...rest} /> : <Navigate to="/login" />;
};

const PublicRoute = ({ element: Component, ...rest }) => {
  const { user } = useAuth();
  return !user ? <Component {...rest} /> : <Navigate to="/home" />;
};

export { PrivateRoute, PublicRoute };
