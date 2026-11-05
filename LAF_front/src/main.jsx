import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import App from './App.jsx';
import { LanguageProvider } from './i18n';
import axios from 'axios';
import { initDisplaySettings } from './utils/settings';

// Đổi port và tên context path ứng với Tomcat của bạn
axios.defaults.baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/LAF_back';
axios.defaults.withCredentials = true;

initDisplaySettings();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)