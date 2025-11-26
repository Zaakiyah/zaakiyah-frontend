import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { initializeFirebase } from './lib/firebase'
import './index.css'
import App from './App.tsx'

// Initialize Firebase on app startup
if (typeof window !== 'undefined') {
	initializeFirebase();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

