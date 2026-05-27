// Global error handler
const errorHandler = (err, req, res, next) => {
  // Log lỗi chi tiết ở server (không gửi cho client)
  console.error('[Error]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Xác định loại lỗi
  let statusCode = err.statusCode || 500;
  let message = 'Lỗi server nội bộ';

  // Các lỗi cụ thể
  if (err.code === 'ENOENT') {
    statusCode = 404;
    message = 'Tệp dữ liệu không tồn tại';
  } else if (err.code === 'EACCES') {
    statusCode = 403;
    message = 'Không có quyền truy cập';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token không hợp lệ';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token đã hết hạn';
  }

  // Trả về response an toàn (không expose internal details)
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Not found handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint không tồn tại',
  });
};

// Async handler wrapper (tránh try-catch trong mỗi route)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
