import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
// Import other routes here as we create them

const app = express();

// Security Middlewares
app.use(helmet()); // Thiết lập HTTP Security Headers

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút'
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20, // Tối đa 20 lần thử đăng nhập
  message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút'
});
app.use('/api/auth', authLimiter);

// Cấu hình CORS (Whitelist)
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin.includes('student-tuition-web.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Truy cập bị từ chối bởi cấu hình CORS'));
    }
  }
};
app.use(cors(corsOptions));

// Giới hạn dung lượng Payload chống tấn công từ chối dịch vụ (Billion laughs, v.v.)
app.use(express.json({ limit: '50mb' })); // Tăng lên 50MB vì có upload file base64 nếu cần, hoặc để mặc định
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Xóa bỏ HTML tags nguy hiểm từ req.body, req.query, req.params
// MUST BE AFTER express.json()
app.use(xss());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/documents', documentRoutes);

export default app;
