import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
import { SpeedInsights } from "@vercel/speed-insights/react"
if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
}
if ('serviceWorker' in navigator) {
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg) reg.update()
            })
        }
    })
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <SpeedInsights/>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <App />
      </ClerkProvider>
  </StrictMode>
)
