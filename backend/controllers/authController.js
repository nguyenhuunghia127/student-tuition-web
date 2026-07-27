import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logActivity } from '../utils/logger.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const authClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    let userId = null;
    let userEmail = email;
    let userRole = 'admin';

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password
    });

    if (!authError && authData?.user) {
      userId = authData.user.id;
      userEmail = authData.user.email;
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (profile && profile.role !== 'admin') {
        return errorResponse(res, 'Bạn không có quyền truy cập quản trị', null, 403);
      }
      if (profile?.role) userRole = profile.role;
    } else {
      return errorResponse(res, 'Sai thông tin đăng nhập', authError, 401);
    }

    await logActivity('admin', userId, 'LOGIN', 'auth', `Admin đăng nhập vào hệ thống (${userEmail})`);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("LỖI NGHIÊM TRỌNG: Chưa cấu hình JWT_SECRET trong môi trường!");
      return errorResponse(res, 'Lỗi cấu hình Server', null, 500);
    }

    const token = jwt.sign(
      { id: userId, email: userEmail, role: userRole },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Thiết lập HttpOnly Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 giờ
    });

    return successResponse(res, {
      user: {
        id: userId,
        email: userEmail,
        role: userRole
      }
    }, 'Đăng nhập thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi hệ thống đăng nhập', error, 500);
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await logActivity(
        decoded.role || 'unknown',
        decoded.id || 'unknown',
        'LOGOUT',
        'auth',
        `${decoded.role === 'admin' ? 'Admin' : (decoded.role === 'student' ? 'Học sinh' : 'Người dùng')} đăng xuất khỏi hệ thống${decoded.role === 'admin' && decoded.email ? ' (bởi ' + decoded.email + ')' : ''}`
      );
    }
  } catch (error) {
    console.error('Logout logging error:', error);
  }

  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0) // Xóa cookie
  });
  return successResponse(res, null, 'Đăng xuất thành công');
};
