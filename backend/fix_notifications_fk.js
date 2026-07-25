import dotenv from 'dotenv';
dotenv.config();

// Script chạy một lần để thêm FK cho bảng notifications.student_id -> students.student_id
// Chạy: node fix_notifications_fk.js

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = `
DO $$
BEGIN
  -- Kiểm tra xem cột student_id đã có trong bảng notifications chưa
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='notifications' AND column_name='student_id'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN student_id UUID;
  END IF;

  -- Kiểm tra xem FK đã tồn tại chưa
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name='notifications_student_id_fkey'
    AND table_name='notifications'
  ) THEN
    ALTER TABLE public.notifications 
    ADD CONSTRAINT notifications_student_id_fkey 
    FOREIGN KEY (student_id) 
    REFERENCES public.students(student_id) 
    ON DELETE SET NULL;
  END IF;
END $$;
`;

async function run() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({ sql })
    });

    if (!res.ok) {
      // Thử dùng approach khác: chỉ kiểm tra cột bằng cách query trực tiếp
      console.log('RPC exec_sql không khả dụng. Đang thử cách thay thế...');
      
      // Kiểm tra cột student_id đã tồn tại chưa
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/notifications?select=student_id&limit=1`, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      });
      
      if (checkRes.ok) {
        console.log('✅ Cột student_id đã tồn tại trong bảng notifications.');
        console.log('ℹ️  Nếu chưa có Foreign Key, bạn cần chạy SQL sau trên Supabase Dashboard:');
        console.log(`
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS student_id UUID;
ALTER TABLE public.notifications 
  ADD CONSTRAINT notifications_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE SET NULL;
        `);
      } else {
        const errData = await checkRes.json();
        console.log('❌ Cột student_id CHƯA tồn tại. Bạn cần chạy SQL sau trên Supabase Dashboard:');
        console.log(`
-- 1. Thêm cột student_id vào bảng notifications
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS student_id UUID;

-- 2. Thêm Foreign Key
ALTER TABLE public.notifications 
  ADD CONSTRAINT notifications_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE SET NULL;
        `);
        console.log('\nLink vào SQL Editor của Supabase:');
        console.log(`${SUPABASE_URL.replace('.supabase.co', '')}.supabase.co/dashboard/project/default/sql`);
      }
    } else {
      console.log('✅ Đã thêm FK thành công!');
    }
  } catch (err) {
    console.error('Lỗi:', err.message);
  }
}

run();
