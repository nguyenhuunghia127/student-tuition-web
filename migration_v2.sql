-- Cập nhật kiến trúc CSDL: Thêm cờ Soft Delete (Xóa mềm) cho bảng Học sinh
-- Giúp bảo toàn dữ liệu liên kết kế toán (học phí, lịch sử thanh toán) khi học sinh nghỉ học

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Cập nhật tất cả bản ghi hiện tại thành false
UPDATE public.students SET is_deleted = FALSE WHERE is_deleted IS NULL;
