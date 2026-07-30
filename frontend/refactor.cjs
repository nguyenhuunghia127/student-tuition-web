const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

if (!code.includes('import Swal')) {
  if (code.includes("import { API_URL } from '../config.js';")) {
    code = code.replace("import { API_URL } from '../config.js';", "import { API_URL } from '../config.js';\nimport Swal from 'sweetalert2';");
  } else {
    code = code.replace("import { API_URL } from '../config.js'", "import { API_URL } from '../config.js'\nimport Swal from 'sweetalert2'");
  }
}

// 1. Replace if (!window.confirm('...')) return
code = code.replace(/if \(!window\.confirm\((['`"])(.*?)\1\)\) return;?/g, (match, quote, message) => {
  return `const confirmResult = await Swal.fire({
      title: 'Xác nhận',
      text: ${quote}${message}${quote},
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });
    if (!confirmResult.isConfirmed) return;`;
});

// 2. Replace inline if (window.confirm('...')) {
code = code.replace(/if\s*\(window\.confirm\((['`"])(.*?)\1\)\)\s*\{/g, (match, quote, message) => {
  return `if ((await Swal.fire({ title: 'Xác nhận', text: ${quote}${message}${quote}, icon: 'warning', showCancelButton: true, confirmButtonText: 'Đồng ý', cancelButtonText: 'Hủy' })).isConfirmed) {`;
});

// 3. Replace alert(...) using balanced parenthesis
let newCode = '';
let i = 0;
while (i < code.length) {
  if (code.substring(i, i + 6) === 'alert(') {
    let start = i + 6;
    let end = start;
    let parens = 1;
    while (end < code.length && parens > 0) {
      if (code[end] === '(') parens++;
      if (code[end] === ')') parens--;
      end++;
    }
    let inner = code.substring(start, end - 1);
    let p1 = inner;
    let swalCall = '';
    if (p1.toLowerCase().includes('err') || p1.toLowerCase().includes('lỗi')) {
      swalCall = `Swal.fire('Lỗi', String(${p1}), 'error')`;
    } else if (p1.toLowerCase().includes('thành công')) {
      swalCall = `Swal.fire({ title: 'Thành công!', text: String(${p1}), icon: 'success', timer: 2000, showConfirmButton: false })`;
    } else {
      swalCall = `Swal.fire('Thông báo', String(${p1}), 'info')`;
    }
    newCode += swalCall;
    i = end;
  } else {
    newCode += code[i];
    i++;
  }
}

fs.writeFileSync('src/pages/AdminDashboard.jsx', newCode, 'utf8');
console.log('Refactoring complete!');
