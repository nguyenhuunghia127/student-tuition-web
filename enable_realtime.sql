-- =========================================================================
-- SCRIPT BẬT TÍNH NĂNG REALTIME TRÊN SUPABASE
-- Chạy đoạn mã này trong trình SQL Editor của Supabase Dashboard
-- =========================================================================

BEGIN;

-- 1. Xóa publication cũ (nếu có) để tránh trùng lặp
DROP PUBLICATION IF EXISTS supabase_realtime;

-- 2. Tạo lại publication cho Supabase Realtime
CREATE PUBLICATION supabase_realtime;

-- 3. Thêm các bảng quan trọng vào luồng Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE 
  notifications, 
  activity_logs, 
  tuition_fees, 
  grades, 
  schedules, 
  assignments, 
  assignment_submissions, 
  leave_requests,
  document_categories,
  documents,
  assignment_documents;

COMMIT;

-- Lưu ý: Nếu bạn có thêm bảng nào trong tương lai muốn gửi tín hiệu Realtime xuống Frontend, hãy thêm bảng đó vào danh sách trên.
