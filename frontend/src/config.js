export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const originalFetch = window.fetch;

window.fetch = async (input, init = {}) => {
  let url = '';
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof Request) {
    url = input.url;
  } else if (input && input.toString) {
    url = input.toString();
  }

  if (url && url.includes(API_URL)) {
    try {
      const adminSession = localStorage.getItem('admin_session');
      const studentProfile = localStorage.getItem('student_profile');
      const parentProfile = localStorage.getItem('parent_profile');
    } catch (e) {
      console.warn('localStorage is not available for fetch interceptor', e);
    }
    // Không cần gắn Authorization header vì đã dùng HttpOnly Cookie
    // Nhưng CẦN bật credentials để trình duyệt tự động gửi Cookie
    init.credentials = 'include';
  }
  return originalFetch(input, init);
};
