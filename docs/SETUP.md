# Setup and Installation Guide

## 📋 Prerequisites

Before setting up the Zaakiyah frontend, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **pnpm**: v8.0.0 or higher (recommended package manager)
  - Install: `npm install -g pnpm`
- **Git**: Latest version

### Recommended Tools

- **VS Code**: Code editor with extensions
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd zaakiyah/zaakiyah-frontend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

### 4. Configure Environment Variables

Edit `.env` with your configuration:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Firebase Configuration (for push notifications)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Optional: Analytics
VITE_GA_MEASUREMENT_ID=your-ga-id
```

### 5. Start Development Server

```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`

### 6. Build for Production

```bash
pnpm run build
```

Production build will be in the `dist/` directory.

### 7. Preview Production Build

```bash
pnpm run preview
```

## 🔧 Development Workflow

### Project Scripts

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Type check (without building)
pnpm run type-check

# Lint code
pnpm run lint

# Preview production build
pnpm run preview
```

### VS Code Configuration

#### Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

#### Recommended Extensions

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Tailwind autocomplete
- **TypeScript Vue Plugin**: TypeScript support
- **Error Lens**: Inline error display

### Debugging

VS Code launch configuration:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## 🎨 Styling

### Tailwind CSS v4

The project uses Tailwind CSS v4 with custom configuration:

- **Configuration**: `tailwind.config.js`
- **Custom Colors**: Primary, success, error, warning
- **Dark Mode**: Custom variant `dark`

### Adding New Styles

1. **Utility Classes**: Use Tailwind utilities directly
2. **Custom Components**: Create component files in `src/components/ui/`
3. **Global Styles**: Add to `src/index.css`

## 🔐 Firebase Setup (Push Notifications)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Cloud Messaging

### 2. Get Configuration

1. Project Settings → General
2. Scroll to "Your apps"
3. Add Web app
4. Copy configuration to `.env`

### 3. Generate Service Account Key (Backend)

1. Project Settings → Service Accounts
2. Generate new private key
3. Add to backend `.env` as `FIREBASE_PRIVATE_KEY`

## 🏗️ Building for Production

### Build Process

```bash
pnpm run build
```

This will:
1. Type-check the code
2. Build with Vite
3. Optimize assets
4. Generate production bundle in `dist/`

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [static assets]
```

### Deployment Options

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify

1. Connect repository to Netlify
2. Build command: `pnpm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard

#### Manual Deployment

1. Build the project: `pnpm run build`
2. Upload `dist/` directory to your hosting service
3. Configure server to serve `index.html` for all routes (SPA)

### Environment Variables in Production

- Set environment variables in your hosting platform
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

## 🧪 Testing (Future)

### Unit Tests

```bash
# Run tests
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
pnpm run test:e2e
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in vite.config.ts
```

#### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Type Errors

```bash
# Type check
pnpm run type-check

# Regenerate types (if using codegen)
pnpm run codegen
```

#### Build Errors

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
pnpm run build
```

### Browser Compatibility

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS Safari, Chrome Mobile
- **Not supported**: IE11

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)



