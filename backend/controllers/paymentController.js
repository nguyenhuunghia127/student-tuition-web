import { supabaseAdmin } from '../supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logActivity } from '../utils/logger.js';

const DEFAULT_BANK_CONFIG = {
  BANK_ID: process.env.BANK_ID || 'VIKKI',
  ACCOUNT_NO: process.env.ACCOUNT_NO || '935042177',
  ACCOUNT_NAME: process.env.ACCOUNT_NAME || 'NGUYEN HUU CHANH',
  STATIC_QR_URL: process.env.STATIC_QR_URL || ''
};

// Lấy thông tin cấu hình tài khoản VietQR
export const getQRConfig = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('system_settings').select('*');

    let config = { ...DEFAULT_BANK_CONFIG };
    if (!error && data && data.length > 0) {
      data.forEach(item => {
        if (config.hasOwnProperty(item.setting_key)) {
          config[item.setting_key] = item.setting_value;
        }
      });
    }

    return successResponse(res, config, 'Lấy cấu hình ngân hàng thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi lấy cấu hình VietQR', error, 500);
  }
};

// Cập nhật cấu hình ngân hàng (Admin)
export const updateQRConfig = async (req, res) => {
  const { BANK_ID, ACCOUNT_NO, ACCOUNT_NAME, STATIC_QR_URL } = req.body;

  try {
    const settingsToUpdate = [
      { setting_key: 'BANK_ID', setting_value: BANK_ID || 'MB', description: 'Mã ngân hàng (MB, VCB, TCB,...)' },
      { setting_key: 'ACCOUNT_NO', setting_value: ACCOUNT_NO || '', description: 'Số tài khoản' },
      { setting_key: 'ACCOUNT_NAME', setting_value: ACCOUNT_NAME || '', description: 'Chủ tài khoản' },
      { setting_key: 'STATIC_QR_URL', setting_value: STATIC_QR_URL || '', description: 'URL ảnh QR tĩnh' }
    ];

    for (const setting of settingsToUpdate) {
      await supabaseAdmin.from('system_settings').upsert(setting);
    }

    await logActivity('admin', req.user?.id || 'admin', 'UPDATE', 'system_settings', 'Cập nhật cấu hình ngân hàng VietQR');
    return successResponse(res, null, 'Cập nhật cấu hình VietQR thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi cập nhật cấu hình VietQR', error, 500);
  }
};

// Sinh thông tin VietQR (Hoàn toàn Miễn phí - VietQR Open API)
export const generateQRCode = async (req, res) => {
  const { fee_id, student_id, amount, title } = req.body;

  if (!fee_id || !student_id || !amount) {
    return errorResponse(res, 'Thiếu thông tin khoản học phí để sinh mã QR');
  }

  try {
    // 1. Lấy thông tin tài khoản nhận
    const { data: settings } = await supabaseAdmin.from('system_settings').select('*');
    let config = { ...DEFAULT_BANK_CONFIG };
    if (settings && settings.length > 0) {
      settings.forEach(item => {
        if (config.hasOwnProperty(item.setting_key)) {
          config[item.setting_key] = item.setting_value;
        }
      });
    }

    // 2. Nội dung chuyển khoản: [Số điện thoại] [Tên học sinh] thanh toan [Tên môn/Tháng]
    const { data: student } = await supabaseAdmin.from('students').select('full_name, phone_number').eq('student_id', student_id).single();

    const removeAccents = (str) => {
      if (str === null || str === undefined) return '';
      return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    };

    const safePhone = removeAccents(student?.phone_number).replace(/\s+/g, '');
    const safeName = removeAccents(student?.full_name || 'Khach');
    const safeTitle = removeAccents(title || 'Hoc phi');

    const transferContent = `${safePhone} ${safeName} thanh toan ${safeTitle}`.substring(0, 50).trim();

    // 3. Nếu Admin có cài ảnh QR tĩnh tùy chỉnh, trả về ảnh tĩnh đó
    let qrImageUrl = config.STATIC_QR_URL;

    // 4. Nếu không có ảnh tĩnh, dùng VietQR Open API (Chuẩn Napas247 - Miễn phí 100%)
    if (!qrImageUrl) {
      const displayBankId = config.BANK_ID.trim();
      // Chuyển đổi tên hiển thị thành mã VietQR hợp lệ (ví dụ Vikki Digital Bank -> VIKKI)
      let qrBankId = displayBankId;
      if (displayBankId.toLowerCase().includes('vikki') || displayBankId.toLowerCase().includes('digital')) {
        qrBankId = 'VIKKI';
      }
      
      const accountNo = config.ACCOUNT_NO.trim();
      const accountName = encodeURIComponent(config.ACCOUNT_NAME.trim());
      const encodedAddInfo = encodeURIComponent(transferContent);

      qrImageUrl = `https://img.vietqr.io/image/${qrBankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedAddInfo}&accountName=${accountName}`;
    }

    return successResponse(res, {
      qrImageUrl,
      bankId: config.BANK_ID,
      accountNo: config.ACCOUNT_NO,
      accountName: config.ACCOUNT_NAME,
      amount: Number(amount),
      transferContent,
      feeTitle: title || 'Học phí'
    }, 'Tạo mã QR thanh toán thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi sinh mã QR thanh toán', error, 500);
  }
};

// Xác nhận học sinh đã chuyển khoản thành công bằng QR
export const confirmQRPayment = async (req, res) => {
  const { student_id, fee_id, amount, transaction_ref } = req.body;

  if (!student_id || !fee_id || !amount) {
    return errorResponse(res, 'Thiếu thông tin xác nhận thanh toán');
  }

  try {
    // Cập nhật trạng thái học phí sang đã thanh toán
    const { error: feeErr } = await supabaseAdmin
      .from('tuition_fees')
      .update({ status: 'paid' })
      .eq('fee_id', fee_id)
      .eq('student_id', student_id);

    if (feeErr) return errorResponse(res, 'Lỗi cập nhật trạng thái học phí', feeErr);

    // Lưu vào lịch sử thanh toán
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payment_history')
      .insert({
        student_id,
        fee_id,
        amount: Number(amount),
        payment_method: 'qr_transfer',
        transaction_ref: transaction_ref || `QR-${Date.now()}`,
        status: 'success',
        paid_at: new Date().toISOString()
      })
      .select()
      .single();

    if (payErr) return errorResponse(res, 'Lỗi ghi nhận lịch sử giao dịch', payErr);

    // Gửi thông báo cho học sinh
    await supabaseAdmin.from('notifications').insert({
      title: 'Xác nhận thanh toán học phí qua VietQR',
      message: `Khoản thanh toán học phí ${Number(amount).toLocaleString('vi-VN')} VND qua VietQR đã được ghi nhận. Cảm ơn bạn!`,
      is_global: false
    });

    const { data: student } = await supabaseAdmin.from('students').select('full_name').eq('student_id', student_id).single();
    await logActivity('student', student_id, 'PAYMENT', 'tuition_fees', `${student?.full_name || 'Học sinh'} đã thanh toán khoản phí ${fee_id.substring(0, 8)} qua mã QR`);

    return successResponse(res, payment, 'Ghi nhận thanh toán qua mã QR thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi xác nhận thanh toán QR', error, 500);
  }
};
