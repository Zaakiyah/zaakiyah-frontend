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
import WealthCalculationPage from './pages/WealthCalculationPage';
import CalculationsPage from './pages/CalculationsPage';
import CalculationDetailsPage from './pages/CalculationDetailsPage';
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
								<ComingSoonPage
									title="Give Zakaat"
									message="Give Zakaat"
									description="Make your Zakaat payments securely and track your contributions. Connect with verified charitable organizations and causes."
								/>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/donations/history"
						element={
							<ProtectedRoute>
								<ComingSoonPage
									title="Donation History"
									message="Donation History"
									description="View your complete donation history, track your contributions over time, and download receipts for your records."
								/>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/sadaqah"
						element={
							<ProtectedRoute>
								<ComingSoonPage
									title="Sadaqah"
									message="Give Sadaqah"
									description="Make voluntary charitable donations (Sadaqah) to support various causes and help those in need. Every contribution makes a difference."
								/>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/apply"
						element={
							<ProtectedRoute>
								<ComingSoonPage
									title="Apply for Assistance"
									message="Apply for Zakaat"
									description="Apply to receive Zakaat assistance if you meet the eligibility criteria. Our team will review your application and connect you with donors."
								/>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/community"
						element={
							<ProtectedRoute>
								<ComingSoonPage
									title="Community"
									message="Community"
									description="Connect with other members of the Zaakiyah community. Share experiences, ask questions, and learn together about Zakaat and charitable giving."
								/>
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
					<Route
						path="/calculate"
						element={
							<ProtectedRoute>
								<WealthCalculationPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/calculations"
						element={
							<ProtectedRoute>
								<CalculationsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/calculations/:id"
						element={
							<ProtectedRoute>
								<CalculationDetailsPage />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</ThemeProvider>
		</ErrorBoundary>
	);
}

export default App;
