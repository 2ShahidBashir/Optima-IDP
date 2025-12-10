import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/useAuth.jsx';

function ProtectedRoute() {
  const { accessToken } = useAuth();
  if (!accessToken) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;

