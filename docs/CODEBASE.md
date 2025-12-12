# Frontend Codebase Documentation

## 📁 Project Structure

```
zaakiyah-frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ai/           # AI advisor components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components
│   │   ├── profile/      # Profile management components
│   │   ├── security/     # Security settings components
│   │   ├── settings/     # Settings components
│   │   ├── stories/      # Impact stories viewer
│   │   ├── ui/           # Base UI components
│   │   └── wealth/       # Wealth calculation components
│   ├── config/           # Configuration files
│   ├── data/             # Static data (stories, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Library configurations
│   ├── pages/            # Page components (routes)
│   ├── schemas/          # Zod validation schemas
│   ├── services/         # API service layers
│   ├── store/            # Zustand state stores
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── docs/                 # Documentation
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🧩 Component Architecture

### Component Categories

#### 1. Pages (`/src/pages/`)
Top-level route components. Each page corresponds to a route in the application.

**Key Pages:**
- `DashboardPage.tsx` - Main dashboard with wealth overview
- `WealthCalculationPage.tsx` - Multi-step wealth calculation wizard
- `CalculationsPage.tsx` - List of all calculations
- `CalculationDetailsPage.tsx` - Detailed view of a calculation
- `ProfilePage.tsx` - User profile view
- `EditProfilePage.tsx` - Profile editing
- `SecurityPage.tsx` - Security settings (2FA, password, sessions)
- `SettingsPage.tsx` - App settings
- `NotificationsPage.tsx` - In-app notifications
- `NisaabHistoryPage.tsx` - Historical Nisaab data

#### 2. UI Components (`/src/components/ui/`)
Reusable base UI components following design system.

**Components:**
- `Button.tsx` - Button component with variants
- `Input.tsx` - Text input field
- `PasswordInput.tsx` - Password input with visibility toggle
- `OtpInput.tsx` - OTP code input (6-digit)
- `CurrencySelector.tsx` - Currency dropdown selector
- `DatePicker.tsx` - Date picker component
- `BottomSheet.tsx` - Bottom sheet modal
- `ConfirmDialog.tsx` - Confirmation dialog
- `Alert.tsx` - Alert/toast notifications
- `ThemeSelector.tsx` - Theme switcher
- `TimezoneSelector.tsx` - Timezone selector
- `PhoneInput.tsx` - Phone number input with country code

#### 3. Feature Components

**Authentication (`/src/components/auth/`):**
- `AuthRoute.tsx` - Redirects authenticated users away from auth pages
- `ProtectedRoute.tsx` - Protects routes requiring authentication
- `AvatarSelector.tsx` - Avatar selection during signup
- `PreferenceSelector.tsx` - User preference selection
- `SignupProgressSteps.tsx` - Signup flow progress indicator
- `DeviceRegistration.tsx` - Device registration for push notifications
- `RootRedirect.tsx` - Root path redirect logic

**Wealth Calculation (`/src/components/wealth/`):**
- `steps/WelcomeStep.tsx` - Welcome/intro step
- `steps/AssetInputStep.tsx` - Asset input form
- `steps/LiabilityInputStep.tsx` - Liability input form
- `steps/NisaabSelectionStep.tsx` - Nisaab base selection
- `steps/CalculationResultsStep.tsx` - Results display
- `steps/SavePreferencesStep.tsx` - Save and notification preferences
- `inputs/AssetInputField.tsx` - Asset input field wrapper
- `inputs/LiabilityInputField.tsx` - Liability input field wrapper
- `inputs/GoldSilverInput.tsx` - Gold/Silver specific input
- `inputs/CustomAssetInput.tsx` - Custom asset input
- `inputs/LivestockInput.tsx` - Livestock input
- `inputs/CurrencyInput.tsx` - Currency input with conversion
- `CurrencyDisplay.tsx` - Display amount with conversion
- `CalculationProgress.tsx` - Wizard progress indicator
- `EmptyState.tsx` - Empty state placeholder
- `LoadingSkeleton.tsx` - Loading skeleton UI

**Layout (`/src/components/layout/`):**
- `ThemeProvider.tsx` - Theme context provider
- `AlertProvider.tsx` - Global alert system provider
- `PageHeader.tsx` - Reusable page header
- `BottomNavigation.tsx` - Bottom navigation bar

**Profile (`/src/components/profile/`):**
- `EditProfileSheet.tsx` - Profile editing bottom sheet
- `AvatarEditSheet.tsx` - Avatar editing

**Security (`/src/components/security/`):**
- `ChangePasswordSheet.tsx` - Password change form
- `Email2FASetupSheet.tsx` - Email 2FA setup
- `TOTP2FASetupSheet.tsx` - TOTP 2FA setup
- `LoginSessionsSection.tsx` - Active sessions management
- `DeleteAccountDialog.tsx` - Account deletion confirmation

## 🎣 Custom Hooks (`/src/hooks/`)

Reusable business logic hooks:

- **`useLogin.ts`** - Login flow with error handling
  ```typescript
  const { login, isLoading, error } = useLogin();
  ```

- **`useSignup.ts`** - Signup flow with validation
  ```typescript
  const { signup, isLoading, error } = useSignup();
  ```

- **`useForgotPassword.ts`** - Password reset request
  ```typescript
  const { sendCode, isLoading } = useForgotPassword();
  ```

- **`useResetPassword.ts`** - Password reset with OTP verification
  ```typescript
  const { resetPassword, isLoading } = useResetPassword();
  ```

- **`useCurrencyConversion.ts`** - Currency conversion with caching
  ```typescript
  const { convertedAmount, isLoading, error } = useCurrencyConversion(
    amount,
    fromCurrency,
    toCurrency
  );
  ```

- **`useScrollToError.ts`** - Auto-scroll to form errors
  ```typescript
  useScrollToError(errors, { offset: 100 });
  ```

- **`useTheme.ts`** - Theme management hook
  ```typescript
  const { theme, toggleTheme } = useTheme();
  ```

## 📦 State Management (`/src/store/`)

Zustand stores for global state:

### `authStore.ts`
Authentication state and user data.

**State:**
- `user: User | null` - Current user object
- `accessToken: string | null` - JWT access token
- `isAuthenticated: boolean` - Auth status

**Actions:**
- `setAuth(user, token)` - Set authenticated user
- `clearAuth()` - Clear authentication
- `updateUser(partial)` - Update user data

### `themeStore.ts`
Theme preferences (light/dark mode).

**State:**
- `theme: 'light' | 'dark' | 'system'`
- `resolvedTheme: 'light' | 'dark'` - Actual theme after system preference

**Actions:**
- `setTheme(theme)` - Set theme preference
- `toggleTheme()` - Toggle between light/dark

### `currencyStore.ts`
Currency data and preferences.

**State:**
- `currencies: Currency[]` - Available currencies
- `loading: boolean` - Loading state

**Actions:**
- `fetchCurrencies()` - Fetch currency list

### `wealthCalculationStore.ts`
Wealth calculation workflow state.

**State:**
- `currentStep: number` - Current wizard step
- `assets: Asset[]` - Collected assets
- `liabilities: Liability[]` - Collected liabilities
- `nisaabBase: 'gold' | 'silver'` - Selected Nisaab base
- `calculationResult: CalculationResult | null` - Calculation results

**Actions:**
- `setStep(step)` - Navigate to step
- `addAsset(asset)` - Add asset
- `updateAsset(id, asset)` - Update asset
- `removeAsset(id)` - Remove asset
- `addLiability(liability)` - Add liability
- `updateLiability(id, liability)` - Update liability
- `removeLiability(id)` - Remove liability
- `setNisaabBase(base)` - Set Nisaab base
- `reset()` - Reset store

### `aiChatStore.ts`
AI chat interface state.

**State:**
- `isOpen: boolean` - Chat modal open state
- `messages: Message[]` - Chat messages
- `isLoading: boolean` - Loading state

**Actions:**
- `openChat()` - Open chat
- `closeChat()` - Close chat
- `addMessage(message)` - Add message
- `setLoading(loading)` - Set loading state

### `alertStore.ts`
Global alert/toast notifications.

**State:**
- `alerts: Alert[]` - Active alerts

**Actions:**
- `showAlert(alert)` - Show alert
- `removeAlert(id)` - Remove alert
- `showSuccess(message)` - Show success alert
- `showError(message)` - Show error alert
- `showWarning(message)` - Show warning alert
- `showInfo(message)` - Show info alert

## 🔌 API Services (`/src/services/`)

Service layer for API communication:

### `authService.ts`
Authentication and user management.

**Methods:**
- `sendSignupCode(email)` - Send signup verification code
- `signup(data)` - Complete signup
- `login(credentials)` - Login
- `logout()` - Logout
- `refreshToken()` - Refresh access token
- `getCurrentUser()` - Get current user
- `updateProfile(data)` - Update profile
- `changePassword(data)` - Change password
- `forgotPassword(email)` - Request password reset
- `resetPassword(data)` - Reset password with code
- `deleteAccount(password)` - Delete account
- `setup2FA(method)` - Setup 2FA
- `verify2FA(code)` - Verify 2FA setup
- `disable2FA(code)` - Disable 2FA
- `verifyLogin2FA(data)` - Verify 2FA during login

### `wealthCalculationService.ts`
Wealth calculation APIs.

**Methods:**
- `calculate(assets, liabilities, nisaabBase, currency)` - Calculate Zakaat
- `saveCalculation(data)` - Save calculation
- `getCalculations()` - Get all calculations
- `getCalculation(id)` - Get calculation details
- `updateCalculation(id, data)` - Update calculation
- `deleteCalculation(id)` - Delete calculation
- `recalculate(id, nisaabData)` - Recalculate with new Nisaab

### `currencyService.ts`
Currency and exchange rate APIs.

**Methods:**
- `getCurrencies()` - Get supported currencies
- `getExchangeRate(base, target)` - Get exchange rate
- `convertCurrency(from, to, amount)` - Convert currency
- `getRateHistory(base, target, startDate, endDate)` - Get historical rates

### `nisaabService.ts`
Nisaab threshold APIs.

**Methods:**
- `getCurrentNisaab()` - Get current Nisaab values
- `getNisaabHistory(startDate, endDate)` - Get historical Nisaab
- `getTodayNisaab()` - Get today's Nisaab

### `notificationService.ts`
Notification APIs.

**Methods:**
- `getNotifications()` - Get in-app notifications
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(id)` - Delete notification
- `updatePreferences(preferences)` - Update notification preferences

### `aiService.ts`
AI advisor APIs.

**Methods:**
- `chat(message, history)` - Send message to AI advisor
- `healthCheck()` - Check AI service availability

### `deviceService.ts`
Device management for push notifications.

**Methods:**
- `registerDevice(data)` - Register device
- `unregisterDevice(deviceToken)` - Unregister device
- `requestPermission()` - Request notification permission

### `sessionService.ts`
Session management.

**Methods:**
- `getSessions()` - Get active sessions
- `revokeSession(sessionId)` - Revoke session

## 🎨 Styling System

### Tailwind CSS v4
- **Configuration**: `tailwind.config.js`
- **Custom Variants**: Dark mode via `@custom-variant dark`
- **Theme Colors**: Primary, success, error, warning colors
- **Responsive Design**: Mobile-first approach

### Dark Mode
- System preference detection
- Manual theme toggle
- Persistent theme selection (localStorage)
- Smooth transitions

### Component Styling Patterns
- Utility-first classes
- Conditional classes with template literals
- Variant props for component variants
- Responsive utilities (`sm:`, `md:`, `lg:`)

## 🛡️ Validation (`/src/schemas/`)

Zod schemas for form validation:

### `auth.schemas.ts`
- `signupSchema` - Signup form validation
- `loginSchema` - Login form validation
- `forgotPasswordSchema` - Forgot password validation
- `resetPasswordSchema` - Reset password validation
- `changePasswordSchema` - Change password validation

**Usage:**
```typescript
import { signupSchema } from '../schemas/auth.schemas';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(signupSchema),
});
```

## 🔧 Utilities (`/src/utils/`)

### `currency.ts`
Currency formatting utilities.

**Functions:**
- `formatCurrency(amount, currency)` - Format currency amount
- `getCurrencySymbol(currency)` - Get currency symbol

### `wealthCalculation.ts`
Wealth calculation utilities.

**Functions:**
- `calculateNetWorth(assets, liabilities)` - Calculate net worth
- `checkNisaab(netWorth, threshold)` - Check if meets Nisaab
- `calculateZakaat(netWorth, rate)` - Calculate Zakaat due

### `wealthValidation.ts`
Input validation utilities.

**Functions:**
- `validateAmount(amount)` - Validate amount input
- `validateAsset(asset)` - Validate asset object
- `validateLiability(liability)` - Validate liability object

### `wealthRecommendations.ts`
Smart recommendations engine.

**Functions:**
- `getRecommendations(calculation)` - Get recommendations
- `recommendNotificationFrequency(calculation)` - Recommend frequency
- `recommendNisaabBase(calculation)` - Recommend Nisaab base

### `logger.ts`
Logging utility (replaces console.log).

**Functions:**
- `logger.log(...args)` - Log info
- `logger.error(...args)` - Log error
- `logger.warn(...args)` - Log warning
- `logger.debug(...args)` - Log debug

## 🔄 Routing (`/src/App.tsx`)

React Router DOM v7 routing configuration.

### Route Structure
```
/ → RootRedirect
/onboarding → OnboardingPage
/login → LoginPage (AuthRoute)
/signup → SignupPage (AuthRoute)
/forgot-password → ForgotPasswordPage (AuthRoute)
/reset-password → ResetPasswordPage (AuthRoute)
/auth/callback → OAuthCallbackPage
/dashboard → DashboardPage (ProtectedRoute)
/wealth/calculate → WealthCalculationPage (ProtectedRoute)
/wealth/calculations → CalculationsPage (ProtectedRoute)
/wealth/calculations/:id → CalculationDetailsPage (ProtectedRoute)
/profile → ProfilePage (ProtectedRoute)
/profile/edit → EditProfilePage (ProtectedRoute)
/nisaab/history → NisaabHistoryPage (ProtectedRoute)
/notifications → NotificationsPage (ProtectedRoute)
/security → SecurityPage (ProtectedRoute)
/settings → SettingsPage (ProtectedRoute)
```

### Route Guards
- **`ProtectedRoute`**: Redirects to login if not authenticated
- **`AuthRoute`**: Redirects to dashboard if already authenticated

## 🎭 Error Handling

### Error Boundary (`ErrorBoundary.tsx`)
Catches React errors and displays fallback UI.

### API Error Handling
- Axios interceptors for error responses
- Global error alerts via `alertStore`
- Form-level error display
- Network error handling

## 📱 Progressive Web App (PWA)

### Service Worker
- Offline support (future)
- Cache management
- Background sync

### Push Notifications
- Firebase Cloud Messaging integration
- Device registration
- Notification permission handling
- Background message handling

## 🧪 Testing Strategy

### Unit Tests (Future)
- Component tests with React Testing Library
- Hook tests
- Utility function tests

### Integration Tests (Future)
- API service tests
- State management tests

### E2E Tests (Future)
- Playwright/Cypress for critical flows
- Authentication flows
- Wealth calculation flows

## 🚀 Performance Optimizations

### Code Splitting
- Route-based code splitting
- Lazy loading of heavy components
- Dynamic imports

### Asset Optimization
- Image optimization
- SVG optimization
- Font optimization

### React Optimizations
- Memoization with `useMemo` and `useCallback`
- React.memo for component memoization
- Optimistic UI updates
- Debouncing form inputs

## 📝 Code Conventions

### File Naming
- Components: PascalCase (e.g., `Button.tsx`)
- Utilities: camelCase (e.g., `currency.ts`)
- Types: camelCase with `.types.ts` suffix (e.g., `auth.types.ts`)

### Component Structure
```typescript
// 1. Imports
import React from 'react';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export default function Component({ prop }: ComponentProps) {
  // 4. Hooks
  // 5. State
  // 6. Effects
  // 7. Handlers
  // 8. Render
  return (
    // JSX
  );
}
```

### TypeScript
- Strict mode enabled
- Explicit types over `any`
- Interface over type for object shapes
- Enums for constants

