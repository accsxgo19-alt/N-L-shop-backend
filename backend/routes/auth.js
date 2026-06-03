const express = require('express');
const { register, login, getCurrentUser, updateAccount, changePassword } = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getCurrentUser);
router.put('/me', auth, updateAccount);
router.put('/change-password', auth, changePassword);

module.exports = router;
