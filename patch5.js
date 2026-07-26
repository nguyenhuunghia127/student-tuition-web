import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix AdminDashboard.jsx
const adminFile = path.join(__dirname, 'frontend', 'src', 'pages', 'AdminDashboard.jsx');
let adminContent = fs.readFileSync(adminFile, 'utf8');
adminContent = adminContent.replace(/import AdminSchedules from '..\/components\/AdminSchedules.jsx'\r?\n/, '');
adminContent = adminContent.replace(/import AdminAssignments from '..\/components\/AdminAssignments.jsx'\r?\n/, '');
adminContent = adminContent.replace(/\{activeSubTab === 'schedules' && <AdminSchedules adminUser=\{adminUser\} \/>\}\r?\n/, '');
adminContent = adminContent.replace(/\{activeSubTab === 'assignments' && <AdminAssignments adminUser=\{adminUser\} \/>\}\r?\n/, '');
fs.writeFileSync(adminFile, adminContent);

// Fix StudentDashboard.jsx
const studentFile = path.join(__dirname, 'frontend', 'src', 'pages', 'StudentDashboard.jsx');
let studentContent = fs.readFileSync(studentFile, 'utf8');

if (!studentContent.includes('StudentLeaveRequests')) {
  studentContent = studentContent.replace(
    /import supabase from '\.\.\/config\/supabase'/,
    "import supabase from '../config/supabase'\nimport { generateInvoice } from '../utils/pdfGenerator'\nimport StudentLeaveRequests from '../components/StudentLeaveRequests.jsx'"
  );
}

fs.writeFileSync(studentFile, studentContent);
console.log('Fixed imports in AdminDashboard and StudentDashboard');
