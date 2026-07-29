import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

// Bắt buộc dùng https:// để tránh lỗi SecurityError (WebSocket Insecure) trên Safari
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = 'https://' + supabaseUrl;
} else if (supabaseUrl.startsWith('http://')) {
  supabaseUrl = supabaseUrl.replace('http://', 'https://');
}

// NGĂN CHẶN CRASH: Nếu đang trên Vercel (https) mà URL lại chứa 'localhost', 
// Supabase sẽ tự động dùng 'ws://' (insecure) gây sập Safari. 
// Chuyển nó thành một URL rác nhưng an toàn (wss) để không bị crash.
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1'))) {
  supabaseUrl = 'https://dummy-project.supabase.co';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
