import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * GuestRoute prevents authenticated users from accessing pages that should only be available to guests
 * such as login and register pages. If the user is already authenticated, they are redirected to homepage.
 */
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If user is already logged in, redirect away from login/register pages
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the children (login/register component)
  return children;
};

export default GuestRoute; 