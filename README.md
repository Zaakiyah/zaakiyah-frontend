# Zaakiyah Frontend

A modern, mobile-first React application for Islamic finance management, built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- 🔐 **Authentication**
  - Email/password login
  - Multi-step signup with email verification
  - Password reset flow
  - OAuth (Google & Apple)
  - Protected routes

- 🎨 **Modern UI/UX**
  - Clean, sleek design
  - Smooth animations with Framer Motion
  - Mobile-first responsive design
  - Accessible components

- 🛠 **Tech Stack**
  - React 19
  - TypeScript
  - Vite
  - Tailwind CSS
  - Framer Motion
  - Zustand (state management)
  - React Hook Form + Zod (form validation)
  - React Router
  - Axios

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm
- Backend API running (zaakiyah-rest-api)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── auth/        # Authentication components
│   └── ui/          # Base UI components
├── lib/             # Utility libraries
├── pages/           # Page components
│   └── auth/        # Authentication pages
├── services/        # API services
├── store/           # Zustand stores
└── App.tsx          # Main app component
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

## Authentication Flow

1. **Login**: Email/password authentication
2. **Signup**: 
   - Step 1: Enter email and receive verification code
   - Step 2: Verify code
   - Step 3: Complete profile information
3. **Password Reset**:
   - Request reset code
   - Enter code and new password

## API Integration

The frontend communicates with the backend API at the URL specified in `VITE_API_URL`. The API endpoints are:

- `POST /auth/login` - User login
- `POST /auth/signup-code` - Request signup verification code
- `POST /auth/signup-code/verify` - Verify signup code
- `POST /auth/signup` - Complete signup
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh access token

## License

Private project

