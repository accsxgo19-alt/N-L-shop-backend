const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    const {
      fullname,
      phone,
      address,
      paymentMethod,
      discountCode = '',
      discountAmount = 0,
      items: requestedItems = [],
    } = req.body || {};

    let orderItems = [];

    if (Array.isArray(requestedItems) && requestedItems.length > 0) {
      const normalizedItems = requestedItems.map((item) => ({
        productId: String(item.productId || item.product || ''),
        quantity: Number(item.quantity) || 0,
      })).filter((item) => item.productId && item.quantity > 0);

      if (normalizedItems.length === 0) {
        return res.status(400).json({ message: 'Dữ liệu đơn hàng không hợp lệ.' });
      }

      const productIds = normalizedItems.map((item) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });

      orderItems = normalizedItems.map((item) => {
        const product = products.find((p) => p._id.toString() === item.productId);
        if (!product) {
          throw new Error(`Sản phẩm không tồn tại khi tạo đơn hàng: ${item.productId}`);
        }
        return {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      });
    } else {
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng trống, không thể tạo đơn hàng.' });
      }
      orderItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'Không có sản phẩm để tạo đơn hàng.' });
    }

    const totalAmount = orderItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product);

        if (!product) {
          throw new Error('Sản phẩm không tồn tại khi tạo đơn hàng');
        }

        if (product.stock < item.quantity) {
          throw new Error(`Sản phẩm ${product.name} không đủ số lượng trong kho.`);
        }

        product.stock -= item.quantity;
        product.sold = (product.sold || 0) + item.quantity;

        await product.save();
      })
    );

    const order = await Order.create({
      user: req.user._id,
      customerName: fullname || req.user.name || req.user.fullname || req.user.email,
      customerEmail: req.user.email,
      customerPhone: phone || req.user.phone || '',
      shippingAddress: address || req.user.address || '',
      paymentMethod: paymentMethod || 'cash',
      discountCode: String(discountCode || '').trim().toUpperCase(),
      discountAmount: Number(discountAmount) || 0,
      items: orderItems,
      totalAmount,
      status: 'pending',
    });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    try {
      const io = req.app.locals.io;
      if (io) {
        io.to(String(req.user._id)).emit('orderCreated', order);
        io.to('admins').emit('newOrder', order);
      }
    } catch (e) {
      console.error('Emit order events failed', e);
    }

    res.status(201).json({
      message: 'Tạo đơn hàng thành công.',
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || 'Lỗi khi tạo đơn hàng.',
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi lấy lịch sử đơn hàng.',
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        message: 'Đơn hàng không tồn tại.',
      });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'Bạn không có quyền xem đơn hàng này.',
      });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi lấy chi tiết đơn hàng.',
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Trạng thái đơn hàng không hợp lệ.',
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        message: 'Không tìm thấy đơn hàng.',
      });
    }

    try {
      const io = req.app.locals.io;
      if (io) {
        io.to(String(order.user._id || order.user)).emit('orderUpdated', order);
        io.to('admins').emit('orderUpdated', order);
      }
    } catch (e) {
      console.error('Emit order updated failed', e);
    }

    res.json({
      message: 'Cập nhật trạng thái đơn hàng thành công.',
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi cập nhật trạng thái đơn hàng.',
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};