import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Scroll-reveal: add .visible to .animate-on-scroll elements when in view
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
});
// Also observe dynamically added elements via MutationObserver
const mutObs = new MutationObserver(() => {
  document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => observer.observe(el));
});
mutObs.observe(document.body, { childList: true, subtree: true });

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '50579602655-56omvj0qhbon88lbc4jst8c4eq39kmeu.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)

