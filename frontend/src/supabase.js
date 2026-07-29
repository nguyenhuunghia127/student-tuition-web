import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

// Bắt buộc dùng https:// để tránh lỗi SecurityError (WebSocket Insecure) trên Safari
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = 'https://' + supabaseUrl;
} else if (supabaseUrl.startsWith('http://')) {
  supabaseUrl = supabaseUrl.replace('http://', 'https://');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
