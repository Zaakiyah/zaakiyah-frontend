import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { hasCompletedOnboarding } from '../../pages/OnboardingPage';

/**
 * RootRedirect component - Intelligently redirects based on authentication status and onboarding
 */
export default function RootRedirect() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	// If authenticated, go to dashboard
	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	// If not authenticated, check if onboarding is completed
	const onboardingCompleted = hasCompletedOnboarding();

	// Redirect to onboarding if not completed, otherwise to login
	return <Navigate to={onboardingCompleted ? '/login' : '/onboarding'} replace />;
}
