import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/authContext'
import { ThemeProvider } from './context/themeContext'
import { ThemedToast } from './components/ThemedToast'
import { Auth0ProviderGate } from './components/auth/Auth0ProviderGate'
import { Auth0SessionBridge } from './components/auth/Auth0SessionBridge'
import { Auth0CallbackErrorWatcher } from './components/auth/Auth0CallbackErrorWatcher'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ThemedToast />
      <BrowserRouter>
        <Auth0CallbackErrorWatcher />
        <Auth0ProviderGate>
          <AuthProvider>
            <Auth0SessionBridge>
              <App />
            </Auth0SessionBridge>
          </AuthProvider>
        </Auth0ProviderGate>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)