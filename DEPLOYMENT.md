# Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Production API server running and accessible
- Environment variables configured

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### Required Variables

- `VITE_API_URL` - Your production API URL (e.g., `https://api.zaakiyah.com`)
- `VITE_FIREBASE_*` - Firebase configuration for push notifications (optional but recommended)

## Build for Production

```bash
pnpm run build
```

This will:
- Type-check the code
- Build optimized production bundle
- Remove console logs
- Generate source maps (disabled for security)
- Create code splits for better caching

The output will be in the `dist/` directory.

## Deployment Options

### Netlify

1. Connect your repository to Netlify
2. Set build command: `pnpm run build`
3. Set publish directory: `dist`
4. Set install command: `pnpm install` (if not auto-detected)
4. Add environment variables in Netlify dashboard
5. Deploy!

The `public/_redirects` file is already configured for SPA routing.

### Vercel

1. Connect your repository to Vercel
2. Framework preset: Vite
3. Build command: `pnpm run build`
4. Output directory: `dist`
5. Install command: `pnpm install` (if not auto-detected)
5. Add environment variables in Vercel dashboard
6. Deploy!

### Static Hosting (AWS S3, Cloudflare Pages, etc.)

1. Build the project: `pnpm run build`
2. Upload the contents of `dist/` to your hosting provider
3. Configure SPA routing:
   - All routes should redirect to `index.html` with 200 status
   - The `_redirects` file is included for Netlify compatibility

## Production Checklist

- [ ] Environment variables configured
- [ ] API URL points to production server
- [ ] CORS configured on backend for your domain
- [ ] Firebase configured (if using push notifications)
- [ ] Build completes without errors
- [ ] Test the deployed application
- [ ] Verify all routes work correctly
- [ ] Check error handling
- [ ] Verify dark mode works
- [ ] Test on mobile devices

## Performance Optimizations

The build is already optimized with:
- Code splitting (vendor, UI, forms, state chunks)
- Tree shaking
- Minification
- Console log removal
- Source map disabled

## Security

- No sensitive data in client-side code
- API keys are server-side only
- Environment variables are not exposed in client bundle
- CORS configured on backend

## Monitoring

Consider adding:
- Error tracking (Sentry, LogRocket, etc.)
- Analytics (Google Analytics, Plausible, etc.)
- Performance monitoring

## Troubleshooting

### Routes not working after deployment

Ensure your hosting provider is configured to serve `index.html` for all routes (SPA routing).

### API calls failing

1. Check `VITE_API_URL` is correct
2. Verify CORS is configured on backend
3. Check browser console for errors

### Build fails

1. Run `pnpm install` to ensure dependencies are installed
2. Check for TypeScript errors: `pnpm run build` will show them
3. Ensure Node.js version is 18+
4. Ensure pnpm is installed: `npm install -g pnpm`

