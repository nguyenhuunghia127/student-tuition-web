export const successResponse = (res, data, message = 'Success') => {
  return res.status(200).json({ success: true, message, data });
};

export const errorResponse = (res, message = 'Error occurred', error = null, status = 400) => {
  console.error(`[API Error] ${message}:`, error);
  return res.status(status).json({ 
    success: false, 
    message, 
    error: error?.message || error || null 
  });
};
