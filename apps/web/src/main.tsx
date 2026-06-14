import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app.css'
import App from './App'
import { registerServiceWorker } from './lib/hooks.client'
import './lib/auth'

registerServiceWorker()

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
