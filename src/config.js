// src/config.js
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

const config = {
  // URL base da aplicação
  APP_URL: isDevelopment 
    ? 'http://localhost:3000' 
    : 'https://rapmarketing.link',
  
  // URL base para links públicos (presaves, smart links)
  PUBLIC_URL: isDevelopment 
    ? 'localhost:3000' 
    : 'rapmarketing.link',
  
  // Outras configurações
  API_URL: process.env.REACT_APP_SUPABASE_URL || '',
  ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
};

export default config;