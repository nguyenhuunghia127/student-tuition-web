import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, 'frontend', 'src', 'pages', 'StudentDashboard.jsx');
let content = fs.readFileSync(file, 'utf8');

// Add imports
if (!content.includes('generateInvoice')) {
  content = content.replace(
    /import \{[^}]+\} from 'lucide-react'/g,
    `import { BookOpen, Users, LayoutDashboard, CreditCard, Bell, Calendar, Clock, CheckCircle2, FileText, Upload, X, LogOut, Shield, MapPin, Phone, User, Settings, Loader2, ChevronRight, GraduationCap, Award, AlertCircle, Download } from 'lucide-react'`
  );
  content = content.replace(
    `import supabase from '../config/supabase'`,
    `import supabase from '../config/supabase'\nimport { generateInvoice } from '../utils/pdfGenerator.js'\nimport StudentLeaveRequests from '../components/StudentLeaveRequests.jsx'`
  );
}

// Add Tab
if (!content.includes('{ id: \'leaves\', label: \'Xin nghỉ phép\', icon: Calendar },')) {
  content = content.replace(
    `{ id: 'tuition', label: 'Học phí', icon: CreditCard },`,
    `{ id: 'tuition', label: 'Học phí', icon: CreditCard },\n            { id: 'leaves', label: 'Xin nghỉ phép', icon: Calendar },`
  );
}

// Add Tab Content
const tabContent = `
            {/* 2.6 TAB XIN NGHỈ PHÉP */}
            {activeTab === 'leaves' && (
              <StudentLeaveRequests data={data} onLeaveSubmit={() => fetchDashboardData(data.student)} />
            )}
`;
if (!content.includes('TAB XIN NGHỈ PHÉP')) {
  content = content.replace(
    `{/* 2.5 TAB THÔNG BÁO */}`,
    tabContent + `\n            {/* 2.5 TAB THÔNG BÁO */}`
  );
}

fs.writeFileSync(file, content);
console.log('Patched StudentDashboard.jsx');
