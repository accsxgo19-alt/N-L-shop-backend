const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware kiểm tra token JWT và lưu thông tin user vào req.user
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn cần đăng nhập để truy cập' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
  }
};

// Middleware kiểm tra role admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Chỉ admin mới được phép thực hiện hành động này' });
  }
};

module.exports = { auth, admin };
