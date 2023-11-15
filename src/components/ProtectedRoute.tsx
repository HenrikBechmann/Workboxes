// ProtectedRoute.tsx based on https://www.robinwieruch.de/react-router-private-routes/
import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ user, children, redirectPath }) {
  if (!user) {
    return <Navigate to = {redirectPath} replace />
  }
  return children
}
export default ProtectedRoute