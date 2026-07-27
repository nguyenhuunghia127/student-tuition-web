-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  user_id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'student'::text CHECK (role = ANY (ARRAY['admin'::text, 'student'::text])),
  student_id uuid,
  CONSTRAINT users_pkey PRIMARY KEY (user_id),
  CONSTRAINT users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.students (
  student_id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  class_name text NOT NULL,
  phone_number text NOT NULL UNIQUE,
  parent_name text,
  parent_phone text,
  status character varying DEFAULT 'active'::character varying,
  enrolled_subjects ARRAY DEFAULT '{}'::text[],
  is_deleted boolean DEFAULT false,
  CONSTRAINT students_pkey PRIMARY KEY (student_id)
);
CREATE TABLE public.tuition_fees (
  fee_id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  title text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'unpaid'::text CHECK (status = ANY (ARRAY['unpaid'::text, 'paid'::text, 'pending'::text])),
  CONSTRAINT tuition_fees_pkey PRIMARY KEY (fee_id),
  CONSTRAINT tuition_fees_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id)
);
CREATE TABLE public.payment_history (
  payment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  fee_id uuid,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  paid_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  status text NOT NULL DEFAULT 'success'::text CHECK (status = ANY (ARRAY['success'::text, 'failed'::text, 'pending'::text])),
  CONSTRAINT payment_history_pkey PRIMARY KEY (payment_id),
  CONSTRAINT payment_history_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id),
  CONSTRAINT payment_history_fee_id_fkey FOREIGN KEY (fee_id) REFERENCES public.tuition_fees(fee_id)
);
CREATE TABLE public.grades (
  grade_id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  subject_name text NOT NULL,
  summary_grade numeric CHECK (summary_grade >= 0.00 AND summary_grade <= 10.00),
  grade_15m numeric CHECK (grade_15m >= 0.00 AND grade_15m <= 10.00),
  grade_45m numeric CHECK (grade_45m >= 0.00 AND grade_45m <= 10.00),
  midterm_grade numeric CHECK (midterm_grade >= 0.00 AND midterm_grade <= 10.00),
  final_grade numeric CHECK (final_grade >= 0.00 AND final_grade <= 10.00),
  CONSTRAINT grades_pkey PRIMARY KEY (grade_id),
  CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id)
);
CREATE TABLE public.assignments (
  assignment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text,
  deadline timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  target_type text CHECK (target_type = ANY (ARRAY['mixed'::text, 'global'::text])),
  target_id text,
  submission_folder_url text,
  CONSTRAINT assignments_pkey PRIMARY KEY (assignment_id)
);
CREATE TABLE public.assignment_submissions (
  submission_id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid,
  student_id uuid,
  file_url text NOT NULL,
  submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  status text NOT NULL DEFAULT 'submitted'::text CHECK (status = ANY (ARRAY['submitted'::text, 'graded'::text, 'late'::text])),
  grade numeric CHECK (grade >= 0.00 AND grade <= 10.00),
  feedback text,
  CONSTRAINT assignment_submissions_pkey PRIMARY KEY (submission_id),
  CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(assignment_id),
  CONSTRAINT assignment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id)
);
CREATE TABLE public.notifications (
  notification_id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  target_type text NOT NULL DEFAULT 'global'::text CHECK (target_type = ANY (ARRAY['mixed'::text, 'global'::text, 'system'::text])),
  target_id text NOT NULL DEFAULT ''::text,
  student_id uuid,
  CONSTRAINT notifications_pkey PRIMARY KEY (notification_id),
  CONSTRAINT notifications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id)
);
CREATE TABLE public.schedules (
  schedule_id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_name text NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  room_name text NOT NULL,
  study_date date NOT NULL,
  target_type text NOT NULL CHECK (target_type = ANY (ARRAY['mixed'::text, 'global'::text])),
  target_id text NOT NULL,
  CONSTRAINT schedules_pkey PRIMARY KEY (schedule_id)
);
CREATE TABLE public.payos_orders (
  order_code text NOT NULL,
  fee_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT payos_orders_pkey PRIMARY KEY (order_code),
  CONSTRAINT payos_orders_fee_id_fkey FOREIGN KEY (fee_id) REFERENCES public.tuition_fees(fee_id),
  CONSTRAINT payos_orders_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id)
);
CREATE TABLE public.attendances (
  attendance_id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  status character varying DEFAULT 'present'::character varying,
  note text,
  CONSTRAINT attendances_pkey PRIMARY KEY (attendance_id),
  CONSTRAINT attendances_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id),
  CONSTRAINT attendances_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(schedule_id)
);
CREATE TABLE public.activity_logs (
  log_id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_role text NOT NULL CHECK (actor_role = ANY (ARRAY['admin'::text, 'student'::text, 'system'::text])),
  actor_id uuid,
  action_type text NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (log_id)
);
CREATE TABLE public.document_categories (
  category_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  class_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  parent_id uuid,
  CONSTRAINT document_categories_pkey PRIMARY KEY (category_id),
  CONSTRAINT document_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.document_categories(category_id)
);
CREATE TABLE public.documents (
  document_id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  drive_link text NOT NULL,
  category_id uuid,
  class_name text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT documents_pkey PRIMARY KEY (document_id),
  CONSTRAINT documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.document_categories(category_id),
  CONSTRAINT documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id)
);
CREATE TABLE public.assignment_documents (
  assignment_id uuid NOT NULL,
  document_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT assignment_documents_pkey PRIMARY KEY (assignment_id, document_id),
  CONSTRAINT assignment_documents_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(assignment_id),
  CONSTRAINT assignment_documents_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(document_id)
);
CREATE TABLE public.grade_appeals (
  appeal_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  subject_name character varying,
  reference_type character varying,
  reference_id uuid,
  reason text NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grade_appeals_pkey PRIMARY KEY (appeal_id),
  CONSTRAINT grade_appeals_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id)
);
CREATE TABLE public.grade_settings (
  setting_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  subject_name character varying UNIQUE,
  weight_15m double precision DEFAULT 1.0,
  weight_45m double precision DEFAULT 2.0,
  weight_mid double precision DEFAULT 2.0,
  weight_final double precision DEFAULT 3.0,
  CONSTRAINT grade_settings_pkey PRIMARY KEY (setting_id)
);
CREATE TABLE public.subjects (
  subject_id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_name text NOT NULL UNIQUE,
  CONSTRAINT subjects_pkey PRIMARY KEY (subject_id)
);
CREATE TABLE public.student_enrolled_subjects (
  student_id uuid NOT NULL,
  subject_name text NOT NULL,
  enrolled_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_enrolled_subjects_pkey PRIMARY KEY (student_id, subject_name),
  CONSTRAINT student_enrolled_subjects_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id)
);
CREATE TABLE public.classes (
  class_id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_name text NOT NULL UNIQUE,
  grade_level integer,
  academic_year text DEFAULT '2024-2025'::text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  subject text,
  tuition_fee numeric,
  CONSTRAINT classes_pkey PRIMARY KEY (class_id)
);
CREATE TABLE public.assignment_targets (
  target_id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type = ANY (ARRAY['global'::text, 'class'::text, 'student'::text])),
  class_id uuid,
  student_id uuid,
  CONSTRAINT assignment_targets_pkey PRIMARY KEY (target_id),
  CONSTRAINT assignment_targets_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(assignment_id),
  CONSTRAINT assignment_targets_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id),
  CONSTRAINT assignment_targets_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id)
);
CREATE TABLE public.notification_targets (
  target_id uuid NOT NULL DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type = ANY (ARRAY['class'::text, 'student'::text])),
  class_id uuid,
  student_id uuid,
  CONSTRAINT notification_targets_pkey PRIMARY KEY (target_id),
  CONSTRAINT notification_targets_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(notification_id),
  CONSTRAINT notification_targets_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id),
  CONSTRAINT notification_targets_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id)
);
CREATE TABLE public.system_settings (
  setting_key text NOT NULL,
  setting_value text NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT system_settings_pkey PRIMARY KEY (setting_key)
);
CREATE TABLE public.student_classes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  class_id uuid,
  enrollment_date timestamp with time zone DEFAULT now(),
  CONSTRAINT student_classes_pkey PRIMARY KEY (id),
  CONSTRAINT student_classes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id),
  CONSTRAINT student_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id)
);
CREATE TABLE public.leave_requests (
  request_id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  leave_date date NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT leave_requests_pkey PRIMARY KEY (request_id),
  CONSTRAINT leave_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id)
);