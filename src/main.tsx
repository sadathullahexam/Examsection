import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initApiFallback } from './apiFallback';

// Initialize the client-side server interceptors for reliable off-grid/static host deployment
initApiFallback();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
