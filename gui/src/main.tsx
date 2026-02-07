import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { ClientProvider } from './providers/ClientProvider';
import App from './App';
import './index.css';

// Build-time (Vercel env) or runtime (?api=URL) or default
function getApiUrl(): string {
  const fromQuery = new URLSearchParams(window.location.search).get('api');
  if (fromQuery) return fromQuery.replace(/\/$/, '');
  return import.meta.env.VITE_API_URL || 'http://localhost:2024';
}
const API_URL = getApiUrl();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NuqsAdapter>
      <ClientProvider deploymentUrl={API_URL}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClientProvider>
    </NuqsAdapter>
  </React.StrictMode>
);
