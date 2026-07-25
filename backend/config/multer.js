import multer from 'multer';

// Configure Multer for file uploads (in-memory)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Định dạng tệp không hợp lệ. Chỉ chấp nhận Excel hoặc CSV.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export default upload;
