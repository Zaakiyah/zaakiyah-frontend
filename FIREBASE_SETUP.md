# Firebase Setup Guide for Frontend

## Overview
For the frontend, you need two types of credentials:
1. **Firebase Web App Configuration** - For initializing Firebase in the browser
2. **VAPID Key** - For web push notifications

## Step 1: Get Firebase Web App Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (the same one you used for the backend service account)
3. Click the **gear icon** (⚙️) next to "Project Overview" → **Project settings**
4. Scroll down to the **"Your apps"** section
5. If you don't have a web app yet:
   - Click **"Add app"** → Select **Web** (</> icon)
   - Register your app with a nickname (e.g., "Zaakiyah Web")
   - You can skip Firebase Hosting for now
6. You'll see your Firebase configuration object that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Note:** The `projectId` should match the one in your backend service account file.

## Step 2: Get VAPID Key for Web Push

1. In the same Firebase Console → **Project settings**
2. Go to the **"Cloud Messaging"** tab
3. Scroll down to **"Web Push certificates"** section
4. If you don't have a key pair yet:
   - Click **"Generate key pair"**
   - A VAPID key will be generated (it's a long string)
5. Copy the **VAPID key** (it looks like: `BElGGi...`)

**Important:** Keep this key secure. You'll need it for web push notifications.

## Step 3: Add to Environment Variables

Create a `.env` file in the frontend root (if it doesn't exist) and add:

```env
# Firebase Web App Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# VAPID Key for Web Push
VITE_FIREBASE_VAPID_KEY=BElGGi...
```

## Alternative: Using Service Account File

If you have the service account JSON file, you can extract:
- `project_id` → Use as `VITE_FIREBASE_PROJECT_ID`
- But you still need to create a web app in Firebase Console to get the other config values
- The VAPID key must be generated separately in the Cloud Messaging tab

## Security Note

- These frontend credentials are **public** (they're exposed in the browser)
- They're safe to include in your frontend code
- The security is handled by Firebase's domain restrictions and API key restrictions
- You can restrict the API key in Google Cloud Console if needed

