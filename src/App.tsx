import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthRoute from './components/auth/AuthRoute';
import RootRedirect from './components/auth/RootRedirect';
import DeviceRegistration from './components/auth/DeviceRegistration';

function App() {
	return (
		<>
			<DeviceRegistration />
			<Routes>
				<Route path="/" element={<RootRedirect />} />
				<Route
					path="/login"
					element={
						<AuthRoute>
							<LoginPage />
						</AuthRoute>
					}
				/>
				<Route
					path="/signup"
					element={
						<AuthRoute>
							<SignupPage />
						</AuthRoute>
					}
				/>
				<Route
					path="/forgot-password"
					element={
						<AuthRoute>
							<ForgotPasswordPage />
						</AuthRoute>
					}
				/>
				<Route
					path="/reset-password"
					element={
						<AuthRoute>
							<ResetPasswordPage />
						</AuthRoute>
					}
				/>
				<Route path="/auth/callback" element={<OAuthCallbackPage />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</>
	);
}

export default App;
