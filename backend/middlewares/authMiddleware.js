import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.js';

export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Không tìm thấy Token xác thực hoặc Token không hợp lệ', null, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-123456-tuition-web');
    
    if (decoded.role !== 'admin') {
      return errorResponse(res, 'Bạn không có quyền truy cập', null, 403);
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', null, 401);
    }
    return errorResponse(res, 'Token không hợp lệ', error, 401);
  }
};
