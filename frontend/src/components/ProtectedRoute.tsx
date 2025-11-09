import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  // If there is no user, redirect to the login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If there is a user, render the child components
  return <>{children}</>;
};

export default ProtectedRoute;