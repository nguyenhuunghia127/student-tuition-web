import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.js';

export const verifyToken = (req, res) => {
  // Ưu tiên token từ cookie, dự phòng từ header (nếu frontend chưa đổi kịp)
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return { error: 'Không tìm thấy Token xác thực', status: 401 };
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("LỖI NGHIÊM TRỌNG: Chưa cấu hình JWT_SECRET trong môi trường!");
      return { error: 'Lỗi cấu hình Server', status: 500 };
    }
    const decoded = jwt.verify(token, jwtSecret);
    return { decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', status: 401 };
    }
    return { error: 'Token không hợp lệ', status: 401 };
  }
};

export const requireAdmin = (req, res, next) => {
  const { decoded, error, status } = verifyToken(req, res);
  if (error) return errorResponse(res, error, null, status);
  
  if (decoded.role !== 'admin') {
    return errorResponse(res, 'Bạn không có quyền truy cập', null, 403);
  }
  
  req.user = decoded;
  next();
};

export const requireStudent = (req, res, next) => {
  const { decoded, error, status } = verifyToken(req, res);
  if (error) return errorResponse(res, error, null, status);
  
  if (decoded.role !== 'student' && decoded.role !== 'admin') {
    return errorResponse(res, 'Quyền truy cập dành cho học sinh', null, 403);
  }
  
  req.user = decoded;
  next();
};

export const requireParent = (req, res, next) => {
  const { decoded, error, status } = verifyToken(req, res);
  if (error) return errorResponse(res, error, null, status);
  
  if (decoded.role !== 'parent' && decoded.role !== 'admin') {
    return errorResponse(res, 'Quyền truy cập dành cho phụ huynh', null, 403);
  }
  
  req.user = decoded;
  next();
};
