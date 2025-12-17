import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthRoute from './components/auth/AuthRoute';
import RootRedirect from './components/auth/RootRedirect';
import DeviceRegistration from './components/auth/DeviceRegistration';
import ZakaatAdvisorChat from './components/ai/ZakaatAdvisorChat';
import { useAiChatStore } from './store/aiChatStore';
import ThemeProvider from './components/layout/ThemeProvider';
import AlertProvider from './components/layout/AlertProvider';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/wealth/LoadingSkeleton';

// Lazy load non-critical pages for better initial load performance
// Keep auth pages eager for faster authentication flow
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const OAuthCallbackPage = lazy(() => import('./pages/auth/OAuthCallbackPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const NisaabHistoryPage = lazy(() => import('./pages/NisaabHistoryPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage'));
const WealthCalculationPage = lazy(() => import('./pages/WealthCalculationPage'));
const CalculationsPage = lazy(() => import('./pages/CalculationsPage'));
const CalculationDetailsPage = lazy(() => import('./pages/CalculationDetailsPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const CommunitySearchPage = lazy(() => import('./pages/CommunitySearchPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const PostEditorPage = lazy(() => import('./pages/PostEditorPage'));
const MemberProfilePage = lazy(() => import('./pages/MemberProfilePage'));
const FollowersPage = lazy(() => import('./pages/FollowersPage'));
const FollowingPage = lazy(() => import('./pages/FollowingPage'));
const KnowledgeResourcePlayerPage = lazy(() => import('./pages/KnowledgeResourcePlayerPage'));
const ZakaatApplicationPage = lazy(() => import('./pages/zakaat/ZakaatApplicationPage'));
const ZakaatApplicationFlowPage = lazy(() => import('./pages/zakaat/ZakaatApplicationFlowPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading fallback component
const PageLoader = () => (
	<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
		<LoadingSkeleton />
	</div>
);

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
				<Suspense fallback={<PageLoader />}>
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
							path="/zakaat/applications"
							element={
								<ProtectedRoute>
									<ZakaatApplicationPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/zakaat/apply"
							element={
								<ProtectedRoute>
									<ZakaatApplicationFlowPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/zakaat/apply/:id"
							element={
								<ProtectedRoute>
									<ZakaatApplicationFlowPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/zakaat/applications/:id"
							element={
								<ProtectedRoute>
									<ZakaatApplicationFlowPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/community"
							element={
								<ProtectedRoute>
									<CommunityPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/community/search"
							element={
								<ProtectedRoute>
									<CommunitySearchPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/community/posts/new"
							element={
								<ProtectedRoute>
									<PostEditorPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/community/posts/:id"
							element={
								<ProtectedRoute>
									<PostDetailPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/community/posts/:id/edit"
							element={
								<ProtectedRoute>
									<PostEditorPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/community/members/:id"
							element={
								<ProtectedRoute>
									<MemberProfilePage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/community/members/:id/followers"
							element={
								<ProtectedRoute>
									<FollowersPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/community/members/:id/following"
							element={
								<ProtectedRoute>
									<FollowingPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/community/knowledge/:id"
							element={
								<ProtectedRoute>
									<KnowledgeResourcePlayerPage />
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
						{/* 404 - Catch all unmatched routes */}
						<Route
							path="*"
							element={
								<ProtectedRoute>
									<NotFoundPage />
								</ProtectedRoute>
							}
						/>
					</Routes>
				</Suspense>
			</ThemeProvider>
		</ErrorBoundary>
	);
}

export default App;
