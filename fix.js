const fs = require('fs');

const files = [
  'frontend/src/components/AdminLeaveRequests.jsx', 
  'frontend/src/components/RevenueChart.jsx', 
  'frontend/src/utils/pdfGenerator.js', 
  'backend/controllers/adminController.js', 
  'backend/controllers/studentController.js'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    // Replace literal backslash followed by backtick with just backtick
    content = content.replace(/\\`/g, '`');
    // Replace literal backslash followed by dollar with just dollar
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(f, content);
  }
});
console.log('Fixed escape characters');
