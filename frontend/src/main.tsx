import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient()
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// Global setup for injecting JWT Authorization header
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.includes('/api/')) {
    config = config || {};
    // Ensure headers exist and are iterable/modifiable
    config.headers = config.headers ? new Headers(config.headers) : new Headers();
    const token = localStorage.getItem('signetra_token');
    if (token && !(config.headers as Headers).has('Authorization')) {
      (config.headers as Headers).append('Authorization', `Bearer ${token}`);
    }
    args[1] = config;
  }
  return originalFetch(...args);
};

const Root = () => {
  const content = (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );

  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
    return content;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {content}
    </GoogleOAuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
