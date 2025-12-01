import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import NisaabHistoryPage from './pages/NisaabHistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import SecurityPage from './pages/SecurityPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthRoute from './components/auth/AuthRoute';
import RootRedirect from './components/auth/RootRedirect';
import DeviceRegistration from './components/auth/DeviceRegistration';
import BottomNavigation from './components/layout/BottomNavigation';
import PageHeader from './components/layout/PageHeader';

function App() {
	return (
		<>
			<DeviceRegistration />
			<Routes>
				<Route path="/" element={<RootRedirect />} />
				<Route path="/onboarding" element={<OnboardingPage />} />
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
				<Route
					path="/donations"
					element={
						<ProtectedRoute>
							<div className="min-h-screen bg-slate-50 pb-20">
								<PageHeader title="Donations" showBack />
								<main className="px-4 py-4">
									<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60 text-center">
										<p className="text-sm text-slate-500">Coming soon...</p>
									</div>
								</main>
								<BottomNavigation />
							</div>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/community"
					element={
						<ProtectedRoute>
							<div className="min-h-screen bg-slate-50 pb-20">
								<PageHeader title="Community" showBack />
								<main className="px-4 py-4">
									<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60 text-center">
										<p className="text-sm text-slate-500">Coming soon...</p>
									</div>
								</main>
								<BottomNavigation />
							</div>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/profile"
					element={
						<ProtectedRoute>
							<ProfilePage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/profile/edit"
					element={
						<ProtectedRoute>
							<EditProfilePage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/nisaab/history"
					element={
						<ProtectedRoute>
							<NisaabHistoryPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/notifications"
					element={
						<ProtectedRoute>
							<NotificationsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/security"
					element={
						<ProtectedRoute>
							<SecurityPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/settings"
					element={
						<ProtectedRoute>
							<SettingsPage />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</>
	);
}

export default App;
