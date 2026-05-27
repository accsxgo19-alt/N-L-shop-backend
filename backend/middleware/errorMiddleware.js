// Xử lý khi không tìm thấy route
const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Route không tồn tại' });
};

// Xử lý lỗi chung cho app
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Có lỗi xảy ra trên server',
  });
};

module.exports = { notFound, errorHandler };
