const express = require('express');
const { auth, admin } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getAllProducts,
  getAllOrders,
  getDashboardStats,
} = require('../controllers/adminController');

const router = express.Router();

router.use(auth);
router.use(admin);
router.get('/users', getAllUsers);
router.get('/products', getAllProducts);
router.get('/orders', getAllOrders);
router.get('/stats', getDashboardStats);

module.exports = router;
