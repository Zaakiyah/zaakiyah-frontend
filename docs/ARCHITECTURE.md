# Zaakiyah Architecture Overview

## 🏗️ System Architecture

Zaakiyah is a modern full-stack application for Islamic financial tracking and Zakaat calculation, built with a separation of concerns between frontend and backend services.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile App  │  │   Website    │     │
│  │  (React SPA) │  │   (Future)   │  │  (Marketing) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│                  (NestJS REST API)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication & Authorization (JWT, OAuth)         │  │
│  │  Request Validation (class-validator)                │  │
│  │  Rate Limiting (Throttler)                           │  │
│  │  Error Handling (Custom Exception Filter)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│  Business Logic  │ │   External   │ │   Scheduled  │
│     Modules      │ │   Services   │ │     Jobs     │
│                  │ │              │ │              │
│ - Auth           │ │ - OpenAI     │ │ - Nisaab     │
│ - Wealth         │ │ - Exchange   │ │   Updates    │
│ - Currency       │ │   Rates      │ │ - Currency   │
│ - Nisaab         │ │ - Firebase   │ │   Rates      │
│ - Notifications  │ │ - Cloudinary │ │ - Reminders  │
│ - AI Advisor     │ │ - Email      │ │              │
└──────────────────┘ └──────────────┘ └──────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │   Firebase   │     │
│  │  (Prisma)    │  │   (Cache &   │  │   (Push      │     │
│  │              │  │   BullMQ)    │  │   Notifs)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Frontend Architecture (React SPA)

### Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **State Management**: Zustand
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4 (with dark mode)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Push Notifications**: Firebase Cloud Messaging

### Architecture Patterns

#### 1. Component-Based Architecture
- **Pages**: Top-level route components (`/src/pages/`)
- **Components**: Reusable UI components (`/src/components/`)
- **Layout Components**: Shared layout structures (`/src/components/layout/`)

#### 2. State Management Strategy
- **Global State**: Zustand stores for:
  - Authentication state (`authStore`)
  - Theme preferences (`themeStore`)
  - Currency data (`currencyStore`)
  - Wealth calculations (`wealthCalculationStore`)
  - AI chat (`aiChatStore`)
  - Alert system (`alertStore`)
- **Local State**: React hooks (`useState`, `useReducer`) for component-specific state
- **Server State**: Custom hooks with API services for data fetching

#### 3. Service Layer Pattern
All API interactions are abstracted through service modules (`/src/services/`):
- `authService.ts` - Authentication & user management
- `wealthCalculationService.ts` - Wealth calculation APIs
- `currencyService.ts` - Currency conversion APIs
- `nisaabService.ts` - Nisaab data APIs
- `notificationService.ts` - Notification APIs
- `aiService.ts` - AI advisor APIs

#### 4. Custom Hooks Pattern
Reusable business logic in custom hooks (`/src/hooks/`):
- `useLogin.ts` - Login flow logic
- `useSignup.ts` - Signup flow logic
- `useCurrencyConversion.ts` - Currency conversion with caching
- `useScrollToError.ts` - Form error scrolling
- `useTheme.ts` - Theme management

#### 5. Type Safety
- TypeScript interfaces in `/src/types/`
- Zod schemas for runtime validation in `/src/schemas/`
- Shared types between frontend and backend (via API responses)

## 🔧 Backend Architecture (NestJS)

### Technology Stack

- **Framework**: NestJS 11 (Node.js)
- **Language**: TypeScript
- **ORM**: Prisma 7 (PostgreSQL)
- **Caching**: Redis (via @nestjs/cache-manager)
- **Job Queue**: BullMQ (Redis-based)
- **Validation**: class-validator & class-transformer
- **Authentication**: JWT + Passport.js (Local, Google OAuth, Apple OAuth)
- **Documentation**: Swagger/OpenAPI
- **Scheduling**: @nestjs/schedule

### Architecture Patterns

#### 1. Modular Architecture
NestJS modules for feature separation:
- `AuthModule` - Authentication & authorization
- `UserModule` - User management
- `WealthModule` - Wealth calculation engine
- `CurrencyModule` - Currency exchange rates
- `NisaabModule` - Nisaab threshold calculations
- `NotificationModule` - Multi-channel notifications
- `AiModule` - AI advisor integration

#### 2. Layered Architecture

```
Controller Layer
    ↓ (DTOs)
Service Layer
    ↓ (Domain Models)
Repository Layer (Prisma)
    ↓
Database
```

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic implementation
- **DTOs**: Data Transfer Objects for validation
- **Repositories**: Database access (via Prisma)

#### 3. Strategy Pattern
Used for:
- **Notification Strategies**: Email, In-App, Push
- **Exchange Rate Providers**: Multiple provider fallback system
- **Auth Strategies**: Local, Google OAuth, Apple OAuth

#### 4. Event-Driven Architecture
- Event emitter for decoupled communication
- Event listeners for side effects (e.g., sending notifications)
- Scheduled jobs for periodic tasks (Nisaab updates, reminders)

#### 5. Queue-Based Processing
- BullMQ for asynchronous job processing
- Notification delivery queues
- Retry mechanisms with exponential backoff

## 🔐 Security Architecture

### Authentication Flow

```
1. User Login
   ↓
2. Validate Credentials
   ↓
3. Generate Access Token (JWT, 15min TTL)
   ↓
4. Generate Refresh Token (stored in DB, 7 days TTL)
   ↓
5. Return Tokens to Client
   ↓
6. Client stores tokens (httpOnly cookies for refresh token)
```

### Authorization

- **JWT Guards**: Protect routes requiring authentication
- **Role-Based Access Control (RBAC)**: Future implementation
- **Token Blacklist**: For logout and token revocation

### Two-Factor Authentication (2FA)

- **Methods**: Email OTP, TOTP (Authenticator App)
- **Recovery Codes**: Backup authentication method
- **Temporary Tokens**: For 2FA verification during login

## 📊 Data Flow

### Wealth Calculation Flow

```
1. User Input (Frontend)
   ↓
2. Validation (Frontend: Zod, Backend: class-validator)
   ↓
3. Currency Conversion (if needed)
   ↓
4. Nisaab Check (Gold/Silver threshold)
   ↓
5. Zakaat Calculation (2.5% of net worth)
   ↓
6. Save to Database
   ↓
7. Schedule Reminders (if enabled)
   ↓
8. Return Results to Frontend
```

### Notification Flow

```
1. Event Triggered (e.g., Nisaab update, calculation reminder)
   ↓
2. Queue Job (BullMQ)
   ↓
3. Process Job (Notification Processor)
   ↓
4. Select Channels (based on user preferences)
   ↓
5. Execute Strategies (Email, In-App, Push)
   ↓
6. Update Notification Status
   ↓
7. Log Results
```

## 🔄 State Synchronization

### Frontend → Backend
- REST API calls via Axios
- Request interceptors for authentication
- Error handling with retry logic

### Backend → Frontend
- Polling (for Nisaab updates)
- WebSocket (future implementation)
- Push notifications (real-time alerts)

## 📦 Deployment Architecture

### Frontend
- **Build**: Vite production build
- **Hosting**: Static hosting (Vercel/Netlify)
- **CDN**: Automatic via hosting platform
- **Environment**: Vite environment variables

### Backend
- **Runtime**: Node.js on Render/Heroku
- **Database**: PostgreSQL (Supabase)
- **Cache/Queue**: Redis (Upstash/Redis Cloud)
- **Storage**: Cloudinary (for avatars)
- **Environment**: `.env` files with secrets

## 🧪 Testing Strategy

### Frontend
- Unit tests (future: Jest + React Testing Library)
- Component tests
- E2E tests (future: Playwright/Cypress)

### Backend
- Unit tests (Jest)
- Integration tests
- E2E tests (Supertest)

## 📈 Scalability Considerations

### Frontend
- Code splitting with Vite
- Lazy loading routes
- Image optimization
- API response caching

### Backend
- Horizontal scaling (stateless design)
- Database connection pooling
- Redis caching layer
- Queue-based job processing
- Rate limiting

## 🔍 Monitoring & Observability

### Current
- NestJS Logger (structured logging)
- Error boundaries (frontend)
- Custom exception filters (backend)

### Future
- Application performance monitoring (APM)
- Error tracking (Sentry)
- Analytics (user behavior)
- Log aggregation (ELK stack)

## 🚀 Performance Optimizations

### Frontend
- React 19 concurrent features
- Memoization (useMemo, useCallback)
- Virtual scrolling (for large lists)
- Optimistic UI updates

### Backend
- Database indexing (via Prisma)
- Query optimization
- Redis caching (frequently accessed data)
- Lazy loading relationships












