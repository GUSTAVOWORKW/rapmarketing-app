import { createClient } from '@supabase/supabase-js';

// TODO: Substitua pelos seus próprios URL e Chave Anônima do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ntreksvrwflivedhvixs.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50cmVrc3Zyd2ZsaXZlZGh2aXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjEwNzMsImV4cCI6MjA2MzY5NzA3M30.h7FtfKQrS2ouGKgHptCap2gC945UvgYI3fxb1-a54zM';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('Supabase URL ou Chave Anônima não configurados. Por favor, adicione-os ao seu arquivo .env ou substitua os placeholders em src/services/supabase.js');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
