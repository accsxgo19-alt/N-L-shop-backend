const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const { createOrder, getMyOrders, getOrderById } = require('../controllers/orderController');

const router = express.Router();

router.use(auth);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
