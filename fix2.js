const fs = require('fs');

const file = 'frontend/src/components/StudentLeaveRequests.jsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
  console.log('Fixed StudentLeaveRequests escape characters');
}
