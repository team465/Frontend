import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ROLE_HOME = { passenger: '/passenger', driver: '/driver', admin: '/admin' };

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole)
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  return children;
}
