import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminFile = path.join(__dirname, 'backend', 'controllers', 'adminController.js');
let adminContent = fs.readFileSync(adminFile, 'utf8');

// 1. Add Soft Delete for getStudents and limits for all GETs
adminContent = adminContent.replace(
  `() => supabaseAdmin.from('students').select('*, classes(class_id, class_name, grade_level), student_classes(classes(class_id, class_name, grade_level, subject, tuition_fee))'),\n      () => supabaseAdmin.from('students').select('*')`,
  `() => supabaseAdmin.from('students').select('*, classes(class_id, class_name, grade_level), student_classes(classes(class_id, class_name, grade_level, subject, tuition_fee))').eq('is_deleted', false).limit(1000),\n      () => supabaseAdmin.from('students').select('*').eq('is_deleted', false).limit(1000)`
);

adminContent = adminContent.replace(
  `() => supabaseAdmin.from('classes').select('*').order('class_name', { ascending: true }),\n      () => supabaseAdmin.from('classes').select('*')`,
  `() => supabaseAdmin.from('classes').select('*').order('class_name', { ascending: true }).limit(1000),\n      () => supabaseAdmin.from('classes').select('*').limit(1000)`
);

adminContent = adminContent.replace(
  `() => supabaseAdmin.from('subjects').select('*').order('subject_name', { ascending: true }),\n      () => supabaseAdmin.from('subjects').select('*')`,
  `() => supabaseAdmin.from('subjects').select('*').order('subject_name', { ascending: true }).limit(1000),\n      () => supabaseAdmin.from('subjects').select('*').limit(1000)`
);

adminContent = adminContent.replace(
  `() => supabaseAdmin.from('grades').select('*, students(student_id, full_name, phone_number, class_name, classes(class_name)), subjects(subject_id, subject_name, subject_code)'),\n      () => supabaseAdmin.from('grades').select('*')`,
  `() => supabaseAdmin.from('grades').select('*, students(student_id, full_name, phone_number, class_name, classes(class_name)), subjects(subject_id, subject_name, subject_code)').limit(1000),\n      () => supabaseAdmin.from('grades').select('*').limit(1000)`
);

adminContent = adminContent.replace(
  `() => supabaseAdmin.from('tuition_fees').select('*, students(full_name, phone_number, class_name, classes(class_name))'),\n      () => supabaseAdmin.from('tuition_fees').select('*, students(full_name, phone_number, class_name)')`,
  `() => supabaseAdmin.from('tuition_fees').select('*, students(full_name, phone_number, class_name, classes(class_name))').limit(1000),\n      () => supabaseAdmin.from('tuition_fees').select('*, students(full_name, phone_number, class_name)').limit(1000)`
);

adminContent = adminContent.replace(
  `() => supabaseAdmin.from('schedules').select('*, classes(class_name), subjects(subject_name, subject_code)'),\n      () => supabaseAdmin.from('schedules').select('*')`,
  `() => supabaseAdmin.from('schedules').select('*, classes(class_name), subjects(subject_name, subject_code)').limit(1000),\n      () => supabaseAdmin.from('schedules').select('*').limit(1000)`
);

// 2. Fix Soft Delete for deleteStudent
adminContent = adminContent.replace(
  /await supabaseAdmin\.from\('students'\)\.delete\(\)\.eq\('student_id', id\);/g,
  `await supabaseAdmin.from('students').update({ is_deleted: true }).eq('student_id', id);`
);

adminContent = adminContent.replace(
  /await supabaseAdmin\.from\('students'\)\.delete\(\)\.in\('student_id', student_ids\);/g,
  `await supabaseAdmin.from('students').update({ is_deleted: true }).in('student_id', student_ids);`
);

// 3. Fix importStudents Chunking
adminContent = adminContent.replace(
  /const { error } = await supabaseAdmin\.from\('students'\)\.insert\(payloads\);/g,
  `let error = null;
    const chunkSize = 500;
    for (let i = 0; i < payloads.length; i += chunkSize) {
      const chunk = payloads.slice(i, i + chunkSize);
      const { error: chunkErr } = await supabaseAdmin.from('students').insert(chunk);
      if (chunkErr) { error = chunkErr; break; }
    }`
);

fs.writeFileSync(adminFile, adminContent, 'utf8');
console.log('adminController.js patched successfully!');
