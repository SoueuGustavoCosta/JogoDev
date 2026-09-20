import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/presentation/app';
import '@/presentation/design-system/tokens.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('elemento #root não encontrado');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
