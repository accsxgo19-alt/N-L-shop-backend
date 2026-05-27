const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng.' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm.' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng.' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const orders = await Order.find();
    const ordersCount = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    res.json({ usersCount, productsCount, ordersCount, totalRevenue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê dashboard.' });
  }
};

module.exports = { getAllUsers, getAllProducts, getAllOrders, getDashboardStats };
