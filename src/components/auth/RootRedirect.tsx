import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * RootRedirect component - Intelligently redirects based on authentication status
 */
export default function RootRedirect() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	// Redirect authenticated users to dashboard, others to login
	return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

