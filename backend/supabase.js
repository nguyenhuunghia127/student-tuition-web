import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_URL.includes('your-project-id')) {
  console.warn('[CẢNH BÁO] Chưa cấu hình thông tin SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY thực tế trong file backend/.env!');
}

// Dùng service role key để thực hiện thao tác admin (RLS bypass)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export const supabasePublic = process.env.SUPABASE_ANON_KEY 
  ? createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    })
  : null;
