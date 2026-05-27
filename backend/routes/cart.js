const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} = require('../controllers/cartController');

const router = express.Router();

router.use(auth);
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeCartItem);

module.exports = router;
