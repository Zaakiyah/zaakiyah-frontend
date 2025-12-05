import { Routes, Route, useLocation } from 'react-router-dom';
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
import ComingSoonPage from './pages/ComingSoonPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthRoute from './components/auth/AuthRoute';
import RootRedirect from './components/auth/RootRedirect';
import DeviceRegistration from './components/auth/DeviceRegistration';
import ZakaatAdvisorChat from './components/ai/ZakaatAdvisorChat';
import { useAiChatStore } from './store/aiChatStore';
import ThemeProvider from './components/layout/ThemeProvider';
import AlertProvider from './components/layout/AlertProvider';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
	const isChatOpen = useAiChatStore((state) => state.isOpen);
	const closeChat = useAiChatStore((state) => state.closeChat);
	const location = useLocation();

	return (
		<ErrorBoundary>
			<ThemeProvider>
				<DeviceRegistration />
				<AlertProvider />
				<ZakaatAdvisorChat isOpen={isChatOpen} onClose={closeChat} />
				<Routes location={location} key={location.pathname}>
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
								<ComingSoonPage title="Donations" />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/community"
						element={
							<ProtectedRoute>
								<ComingSoonPage title="Community" />
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
			</ThemeProvider>
		</ErrorBoundary>
	);
}

export default App;
