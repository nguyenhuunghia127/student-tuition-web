import express from 'express';
import { getQRConfig, updateQRConfig, generateQRCode, confirmQRPayment } from '../controllers/paymentController.js';
import { requireAdmin, requireStudent } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/qr-config', getQRConfig); // Mọi người đều có thể xem config (khi thanh toán)
router.put('/qr-config', requireAdmin, updateQRConfig); // Chỉ Admin được sửa
router.post('/generate-qr', requireStudent, generateQRCode); // Học sinh tạo QR
router.post('/confirm-qr', requireStudent, confirmQRPayment); // Học sinh xác nhận thanh toán

export default router;
