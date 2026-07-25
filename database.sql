-- =============================================================================
-- DATABASE SCHEMA: STUDENT TUITION & LEARNING MANAGEMENT (CHUẨN 3NF & ACID)
-- =============================================================================

-- 1. BANG DANH MUC LOP HOC (Classes)
CREATE TABLE IF NOT EXISTS public.classes (
    class_id uuid NOT NULL DEFAULT gen_random_uuid(),
    class_name text NOT NULL UNIQUE,
    grade_level integer, -- Vi du: 10, 11, 12
    academic_year text DEFAULT '2024-2025'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT classes_pkey PRIMARY KEY (class_id)
);

-- 2. BANG HOC SINH (Students)
CREATE TABLE IF NOT EXISTS public.students (
    student_id uuid NOT NULL DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    class_id uuid NOT NULL,
    phone_number text NOT NULL UNIQUE,
    parent_name text,
    parent_phone text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT students_pkey PRIMARY KEY (student_id),
    CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id) ON DELETE RESTRICT
);

-- 3. BANG USERS (Nguoi dung Admin & Hop nhat Auth)
CREATE TABLE IF NOT EXISTS public.users (
    user_id uuid NOT NULL,
    email text NOT NULL UNIQUE,
    role text NOT NULL DEFAULT 'student'::text CHECK (
        role = ANY (ARRAY ['admin'::text, 'student'::text])
    ),
    student_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE SET NULL
);

-- 4. BANG MON HOC (Subjects)
CREATE TABLE IF NOT EXISTS public.subjects (
    subject_id uuid NOT NULL DEFAULT gen_random_uuid(),
    subject_code text NOT NULL UNIQUE,
    subject_name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT subjects_pkey PRIMARY KEY (subject_id)
);

-- 5. BANG HOC PHI (Tuition Fees)
CREATE TABLE IF NOT EXISTS public.tuition_fees (
    fee_id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    title text NOT NULL,
    amount numeric NOT NULL CHECK (amount >= 0::numeric),
    due_date date NOT NULL,
    status text NOT NULL DEFAULT 'unpaid'::text CHECK (
        status = ANY (ARRAY ['unpaid'::text, 'paid'::text])
    ),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT tuition_fees_pkey PRIMARY KEY (fee_id),
    CONSTRAINT tuition_fees_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE
);

-- 6. BANG LICH SU THANH TOAN (Payment History)
CREATE TABLE IF NOT EXISTS public.payment_history (
    payment_id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    fee_id uuid NOT NULL,
    amount numeric NOT NULL CHECK (amount >= 0::numeric),
    payment_method text NOT NULL DEFAULT 'qr_transfer'::text CHECK (
        payment_method = ANY (ARRAY ['qr_transfer'::text, 'cash'::text])
    ),
    transaction_ref text,
    paid_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    status text NOT NULL DEFAULT 'success'::text CHECK (
        status = ANY (ARRAY ['success'::text, 'failed'::text])
    ),
    CONSTRAINT payment_history_pkey PRIMARY KEY (payment_id),
    CONSTRAINT payment_history_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE,
    CONSTRAINT payment_history_fee_id_fkey FOREIGN KEY (fee_id) REFERENCES public.tuition_fees(fee_id) ON DELETE CASCADE
);

-- 7. BANG BANG DIEM (Grades)
CREATE TABLE IF NOT EXISTS public.grades (
    grade_id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    semester integer NOT NULL DEFAULT 1 CHECK (semester IN (1, 2)),
    academic_year text NOT NULL DEFAULT '2024-2025'::text,
    score_15m numeric CHECK (score_15m >= 0.00 AND score_15m <= 10.00),
    score_45m numeric CHECK (score_45m >= 0.00 AND score_45m <= 10.00),
    score_midterm numeric CHECK (score_midterm >= 0.00 AND score_midterm <= 10.00),
    score_final numeric CHECK (score_final >= 0.00 AND score_final <= 10.00),
    score_summary numeric CHECK (score_summary >= 0.00 AND score_summary <= 10.00),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT grades_pkey PRIMARY KEY (grade_id),
    CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE,
    CONSTRAINT grades_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE,
    CONSTRAINT grades_unique_entry UNIQUE (student_id, subject_id, semester, academic_year)
);

-- 8. BANG CAU HINH HE SO DIEM (Grade Settings)
CREATE TABLE IF NOT EXISTS public.grade_settings (
    setting_id uuid NOT NULL DEFAULT gen_random_uuid(),
    weight_15m numeric NOT NULL DEFAULT 0.10 CHECK (weight_15m >= 0 AND weight_15m <= 1),
    weight_45m numeric NOT NULL DEFAULT 0.20 CHECK (weight_45m >= 0 AND weight_45m <= 1),
    weight_midterm numeric NOT NULL DEFAULT 0.30 CHECK (weight_midterm >= 0 AND weight_midterm <= 1),
    weight_final numeric NOT NULL DEFAULT 0.40 CHECK (weight_final >= 0 AND weight_final <= 1),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT grade_settings_pkey PRIMARY KEY (setting_id)
);

-- 9. BANG PHUC KHAO DIEM (Grade Appeals)
CREATE TABLE IF NOT EXISTS public.grade_appeals (
    appeal_id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    grade_id uuid,
    reason text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text CHECK (
        status = ANY (ARRAY ['pending'::text, 'approved'::text, 'rejected'::text])
    ),
    admin_response text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT grade_appeals_pkey PRIMARY KEY (appeal_id),
    CONSTRAINT grade_appeals_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE,
    CONSTRAINT grade_appeals_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE,
    CONSTRAINT grade_appeals_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(grade_id) ON DELETE SET NULL
);

-- 10. BANG BAI TAP (Assignments)
CREATE TABLE IF NOT EXISTS public.assignments (
    assignment_id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    file_url text,
    deadline timestamp with time zone NOT NULL,
    submission_folder_url text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT assignments_pkey PRIMARY KEY (assignment_id)
);

-- 11. BANG TRUNG GIAN GIAO BAI TAP (Assignment Targets - 3NF)
CREATE TABLE IF NOT EXISTS public.assignment_targets (
    target_id uuid NOT NULL DEFAULT gen_random_uuid(),
    assignment_id uuid NOT NULL,
    target_type text NOT NULL CHECK (target_type = ANY (ARRAY ['global'::text, 'class'::text, 'student'::text])),
    class_id uuid,
    student_id uuid,
    CONSTRAINT assignment_targets_pkey PRIMARY KEY (target_id),
    CONSTRAINT assignment_targets_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(assignment_id) ON DELETE CASCADE,
    CONSTRAINT assignment_targets_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id) ON DELETE CASCADE,
    CONSTRAINT assignment_targets_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE
);

-- 12. BANG NOP BAI TAP (Assignment Submissions)
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    submission_id uuid NOT NULL DEFAULT gen_random_uuid(),
    assignment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    file_url text NOT NULL,
    submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    status text NOT NULL DEFAULT 'submitted'::text CHECK (
        status = ANY (ARRAY ['submitted'::text, 'graded'::text, 'late'::text])
    ),
    grade numeric CHECK (grade >= 0.00 AND grade <= 10.00),
    feedback text,
    CONSTRAINT assignment_submissions_pkey PRIMARY KEY (submission_id),
    CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(assignment_id) ON DELETE CASCADE,
    CONSTRAINT assignment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE,
    CONSTRAINT assignment_submissions_unique UNIQUE (assignment_id, student_id)
);

-- 13. BANG THOI KHOA BIEU (Schedules)
CREATE TABLE IF NOT EXISTS public.schedules (
    schedule_id uuid NOT NULL DEFAULT gen_random_uuid(),
    class_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    room_name text NOT NULL,
    study_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT schedules_pkey PRIMARY KEY (schedule_id),
    CONSTRAINT schedules_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id) ON DELETE CASCADE,
    CONSTRAINT schedules_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id) ON DELETE CASCADE
);

-- 14. BANG DIEM DANH (Attendances)
CREATE TABLE IF NOT EXISTS public.attendances (
    attendance_id uuid NOT NULL DEFAULT gen_random_uuid(),
    schedule_id uuid NOT NULL,
    student_id uuid NOT NULL,
    is_present boolean NOT NULL DEFAULT false,
    note text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT attendances_pkey PRIMARY KEY (attendance_id),
    CONSTRAINT attendances_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(schedule_id) ON DELETE CASCADE,
    CONSTRAINT attendances_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE,
    CONSTRAINT attendances_unique UNIQUE (schedule_id, student_id)
);

-- 15. BANG DANH MUC TAI LIEU (Document Categories)
CREATE TABLE IF NOT EXISTS public.document_categories (
    category_id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT document_categories_pkey PRIMARY KEY (category_id)
);

-- 16. BANG TAI LIEU HOC TAP (Documents)
CREATE TABLE IF NOT EXISTS public.documents (
    document_id uuid NOT NULL DEFAULT gen_random_uuid(),
    category_id uuid,
    class_id uuid,
    title text NOT NULL,
    description text,
    drive_link text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT documents_pkey PRIMARY KEY (document_id),
    CONSTRAINT documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.document_categories(category_id) ON DELETE SET NULL,
    CONSTRAINT documents_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id) ON DELETE CASCADE,
    CONSTRAINT documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL
);

-- 17. BANG TRUNG GIAN TAI LIEU BAI TAP (Assignment Documents)
CREATE TABLE IF NOT EXISTS public.assignment_documents (
    assignment_id uuid NOT NULL,
    document_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT assignment_documents_pkey PRIMARY KEY (assignment_id, document_id),
    CONSTRAINT assignment_documents_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(assignment_id) ON DELETE CASCADE,
    CONSTRAINT assignment_documents_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(document_id) ON DELETE CASCADE
);

-- 18. BANG THONG BAO (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    message text NOT NULL,
    is_global boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT notifications_pkey PRIMARY KEY (notification_id)
);

-- 19. BANG TRUNG GIAN NGUOI NHAN THONG BAO (Notification Targets - 3NF)
CREATE TABLE IF NOT EXISTS public.notification_targets (
    target_id uuid NOT NULL DEFAULT gen_random_uuid(),
    notification_id uuid NOT NULL,
    target_type text NOT NULL CHECK (target_type = ANY (ARRAY ['class'::text, 'student'::text])),
    class_id uuid,
    student_id uuid,
    CONSTRAINT notification_targets_pkey PRIMARY KEY (target_id),
    CONSTRAINT notification_targets_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(notification_id) ON DELETE CASCADE,
    CONSTRAINT notification_targets_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id) ON DELETE CASCADE,
    CONSTRAINT notification_targets_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE
);

-- 20. BANG NHAT KY HOAT DONG (Activity Logs)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    log_id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_type text NOT NULL CHECK (user_type = ANY (ARRAY ['admin'::text, 'student'::text, 'system'::text])),
    user_id uuid,
    action text NOT NULL,
    entity_type text NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT activity_logs_pkey PRIMARY KEY (log_id)
);

-- 21. BANG CAU HINH HE THONG & QR THANH TOAN (System Settings)
CREATE TABLE IF NOT EXISTS public.system_settings (
    setting_key text NOT NULL,
    setting_value text NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT system_settings_pkey PRIMARY KEY (setting_key)
);

-- CHEN DU LIEU MAC DINH CHO SYSTEM SETTINGS (Cấu hình VietQR & Ngân hàng mặc định)
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
    ('BANK_ID', 'MB', 'Mã ngân hàng (MB, VCB, TCB, ACB, VPB, ICB, ...)'),
    ('ACCOUNT_NO', '090123456789', 'Số tài khoản ngân hàng nhận học phí'),
    ('ACCOUNT_NAME', 'TRUONG HOC PHI TUITION WEB', 'Tên chủ tài khoản ngân hàng'),
    ('STATIC_QR_URL', '', 'Link ảnh QR tĩnh tùy chỉnh do Admin tải lên (nếu có)')
ON CONFLICT (setting_key) DO NOTHING;