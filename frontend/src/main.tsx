import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Versiyon kontrolü ile eski verileri temizle
const APP_VERSION = '2.1.0-names';
const storedVersion = localStorage.getItem('app_version');

if (storedVersion !== APP_VERSION) {
  // Tüm localStorage'ı temizle (eski veriler, eski oturumlar)
  localStorage.clear();
  localStorage.setItem('app_version', APP_VERSION);
  console.log('🔄 Uygulama güncellendi, eski veriler temizlendi.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
