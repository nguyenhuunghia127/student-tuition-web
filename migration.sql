-- 1. Cho phép class_id được phép rỗng và cập nhật Constraint để tự động chuyển về NULL khi xóa lớp (Thay vì báo lỗi khóa)
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_class_id_fkey;
ALTER TABLE public.students ALTER COLUMN class_id DROP NOT NULL;
ALTER TABLE public.students ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id) ON DELETE SET NULL;

-- 2. Thêm trạng thái 'pending' vào check constraint của tuition_fees và payment_history để hỗ trợ chức năng "Chờ duyệt"
ALTER TABLE public.tuition_fees DROP CONSTRAINT IF EXISTS tuition_fees_status_check;
ALTER TABLE public.tuition_fees ADD CONSTRAINT tuition_fees_status_check CHECK (status = ANY (ARRAY['unpaid'::text, 'paid'::text, 'pending'::text]));

ALTER TABLE public.payment_history DROP CONSTRAINT IF EXISTS payment_history_status_check;
ALTER TABLE public.payment_history ADD CONSTRAINT payment_history_status_check CHECK (status = ANY (ARRAY['success'::text, 'failed'::text, 'pending'::text]));

-- 3. Cập nhật Stored Procedure để thực hiện Xóa và Thêm vào bảng student_classes trong 1 Transaction
CREATE OR REPLACE FUNCTION update_student_classes(p_student_id UUID, p_class_ids UUID[]) 
RETURNS void AS $$ 
BEGIN 
  DELETE FROM student_classes WHERE student_id = p_student_id; 
  IF array_length(p_class_ids, 1) > 0 THEN 
    INSERT INTO student_classes (student_id, class_id) 
    SELECT p_student_id, unnest(p_class_ids); 
  END IF; 
END; 
$$ LANGUAGE plpgsql;
