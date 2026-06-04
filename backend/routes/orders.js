const express = require('express');
const { auth, admin } = require('../middleware/authMiddleware');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

router.use(auth);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/', admin, getAllOrders);

router.put('/:id/status', admin, updateOrderStatus);
router.put('/:id', admin, updateOrderStatus);

router.get('/:id', getOrderById);

module.exports = router;