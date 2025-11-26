import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface AuthRouteProps {
	children: React.ReactNode;
}

/**
 * AuthRoute component - Redirects authenticated users away from auth pages
 * This prevents logged-in users from accessing login/signup pages
 */
export default function AuthRoute({ children }: AuthRouteProps) {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	// If user is already authenticated, redirect to dashboard
	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	return <>{children}</>;
}

