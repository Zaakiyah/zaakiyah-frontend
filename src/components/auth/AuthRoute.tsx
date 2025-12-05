import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface AuthRouteProps {
	children: React.ReactNode;
}

export default function AuthRoute({ children }: AuthRouteProps) {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const location = useLocation();

	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	return (
		<>
			{React.isValidElement(children)
				? React.cloneElement(children, { key: location.pathname } as any)
				: children}
		</>
	);
}

