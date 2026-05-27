const { body, validationResult } = require('express-validator');

// Xử lý validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dữ liệu không hợp lệ',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation cho đăng ký
const validateRegister = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải tối thiểu 6 ký tự'),
  handleValidationErrors,
];

// Validation cho đăng nhập
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc'),
  handleValidationErrors,
];

// Validation cho checkout
const validateCheckout = [
  body('fullname')
    .trim()
    .notEmpty().withMessage('Họ tên là bắt buộc')
    .isLength({ min: 2, max: 100 }).withMessage('Họ tên phải từ 2-100 ký tự')
    .matches(/^[\p{L}\s]+$/u).withMessage('Họ tên chỉ chứa chữ cái và khoảng trắng'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Số điện thoại là bắt buộc')
    .matches(/^0[0-9]{9,10}$/).withMessage('Số điện thoại không hợp lệ'),

  body('address')
    .trim()
    .notEmpty().withMessage('Địa chỉ là bắt buộc')
    .isLength({ min: 10, max: 500 }).withMessage('Địa chỉ phải từ 10-500 ký tự'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('paymentMethod')
    .optional()
    .isIn(['cash', 'banking', 'cod', 'bank', 'momo', 'vnpay']).withMessage('Phương thức thanh toán không hợp lệ'),

  body('items')
    .isArray({ min: 1 }).withMessage('Giỏ hàng không được trống'),

  body('items.*.productId')
    .notEmpty().withMessage('ID sản phẩm là bắt buộc')
    .isString().withMessage('ID sản phẩm phải là chuỗi'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 99 }).withMessage('Số lượng phải từ 1-99'),

  body('discountCode')
    .optional({ nullable: true })
    .isString().withMessage('Mã giảm giá phải là chuỗi'),

  body('discountAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Số tiền giảm giá không được âm'),

  handleValidationErrors,
];

// Validation cho mã giảm giá
const validateDiscount = [
  body('code')
    .trim()
    .notEmpty().withMessage('Mã giảm giá là bắt buộc')
    .isLength({ min: 4, max: 20 }).withMessage('Mã giảm giá phải từ 4-20 ký tự')
    .matches(/^[A-Z0-9]+$/).withMessage('Mã giảm giá chỉ chứa chữ cái in hoa và số'),

  body('type')
    .optional()
    .isIn(['percent', 'fixed']).withMessage('Loại giảm giá không hợp lệ'),

  body('value')
    .optional()
    .isFloat({ min: 0 }).withMessage('Giá trị giảm giá không được âm'),

  handleValidationErrors,
];

// Validation cho sản phẩm
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên sản phẩm là bắt buộc')
    .isLength({ min: 2, max: 200 }).withMessage('Tên sản phẩm phải từ 2-200 ký tự'),

  body('price')
    .isFloat({ min: 1000, max: 999999999 }).withMessage('Giá sản phẩm phải từ 1,000đ - 999,999,999đ'),

  body('category')
    .trim()
    .notEmpty().withMessage('Danh mục là bắt buộc')
    .isIn(['Áo', 'Quần', 'Váy', 'Giày', 'Phụ kiện']).withMessage('Danh mục không hợp lệ'),

  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCheckout,
  validateDiscount,
  validateProduct,
  handleValidationErrors,
};
