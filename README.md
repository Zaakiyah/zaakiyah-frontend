# Zaakiyah Frontend

Modern React application for managing Zakat calculations and Islamic financial tracking.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Firebase** - Push notifications

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm (install with `npm install -g pnpm`)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
pnpm run build
```

Production build will be in the `dist/` directory.

### Preview Production Build

```bash
pnpm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `VITE_API_URL` - Backend API URL
- `VITE_FIREBASE_*` - Firebase configuration (optional)

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── auth/       # Authentication components
│   ├── layout/     # Layout components
│   ├── profile/    # Profile-related components
│   ├── security/   # Security components
│   └── ui/         # Base UI components
├── hooks/          # Custom React hooks
├── lib/            # Library configurations
├── pages/          # Page components
├── schemas/        # Validation schemas
├── services/       # API services
├── store/          # Zustand stores
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## Features

- ✅ Dark mode support
- ✅ Responsive design
- ✅ Form validation
- ✅ Error boundaries
- ✅ Push notifications
- ✅ Theme persistence
- ✅ Currency conversion
- ✅ Nisaab calculations
- ✅ User authentication
- ✅ Profile management

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## License

Private - All rights reserved
