import express from 'express';
import { getQRConfig, updateQRConfig, generateQRCode, confirmQRPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/qr-config', getQRConfig);
router.put('/qr-config', updateQRConfig);
router.post('/generate-qr', generateQRCode);
router.post('/confirm-qr', confirmQRPayment);

export default router;
