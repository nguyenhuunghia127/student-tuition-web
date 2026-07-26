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
    const adminSession = localStorage.getItem('admin_session');
    const studentProfile = localStorage.getItem('student_profile');
    const parentProfile = localStorage.getItem('parent_profile');

    let token = null;
    if (adminSession) {
      try { token = JSON.parse(adminSession).token; } catch (e) {}
    } else if (studentProfile) {
      try { token = JSON.parse(studentProfile).token; } catch (e) {}
    } else if (parentProfile) {
      try { token = JSON.parse(parentProfile).token; } catch (e) {}
    }

    if (token) {
      init.headers = {
        ...init.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  return originalFetch(input, init);
};
