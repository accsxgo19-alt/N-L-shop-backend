const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const LEGACY_PRODUCT_ID_ALIASES = {
  '001': 'Áo Thun Basic',
  '002': 'Áo Sơ Mi Nam',
  '003': 'Áo Len Nữ',
  '004': 'Quần Jeans Xanh',
  '005': 'Quần Tây Nam',
  '006': 'Quần Legging Nữ',
  '007': 'Váy Hoa Nữ',
  '008': 'Váy Xếp Li',
  '009': 'Giày Sneaker Trắng',
  '010': 'Giày Cao Gót',
  '011': 'Dép Nữ',
  '012': 'Túi Xách',
  '013': 'Ví Da Nam',
  '014': 'Mũ Lưỡi Trai',
  '015': 'Dây Chuyền Vàng',
};

const resolveOrderProducts = async (productIds = []) => {
  const normalizedIds = productIds
    .filter(Boolean)
    .map((id) => String(id).trim())
    .filter(Boolean);

  if (!normalizedIds.length) {
    return [];
  }

  const objectIds = normalizedIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const aliasNames = normalizedIds
    .map((id) => LEGACY_PRODUCT_ID_ALIASES[String(id).trim()])
    .filter(Boolean);
  const conditions = [{ id: { $in: normalizedIds } }];

  if (objectIds.length) {
    conditions.push({ _id: { $in: objectIds } });
  }

  if (aliasNames.length) {
    conditions.push({ name: { $in: aliasNames } });
  }

  const products = await Product.find({ $or: conditions });
  const seenIds = new Set(products.map((product) => String(product._id)));
  const legacyIds = normalizedIds.filter((id) => LEGACY_PRODUCT_ID_ALIASES[String(id).trim()]);

  if (legacyIds.length) {
    const sortedProducts = await Product.find({}).sort({ _id: 1 });
    legacyIds.forEach((legacyId) => {
      const aliasName = LEGACY_PRODUCT_ID_ALIASES[String(legacyId).trim()];
      const product =
        products.find((item) => String(item.id || '') === String(legacyId) || item.name === aliasName) ||
        sortedProducts[Number(legacyId) - 1];

      if (product && !seenIds.has(String(product._id))) {
        products.push(product);
        seenIds.add(String(product._id));
      }

      if (product) {
        product.$locals.legacyProductIds = product.$locals.legacyProductIds || [];
        if (!product.$locals.legacyProductIds.includes(String(legacyId))) {
          product.$locals.legacyProductIds.push(String(legacyId));
        }
      }
    });
  }

  return products;
};

const buildProductLookup = (products = []) => {
  const lookup = new Map();

  products.forEach((product) => {
    if (!product) return;
    if (product._id) {
      lookup.set(String(product._id), product);
    }
    if (product.id) {
      lookup.set(String(product.id), product);
    }
    (product.$locals?.legacyProductIds || []).forEach((legacyId) => {
      lookup.set(String(legacyId), product);
    });

    const legacyId = Object.entries(LEGACY_PRODUCT_ID_ALIASES).find(
      ([, productName]) => productName === product.name
    )?.[0];

    if (legacyId) {
      lookup.set(String(legacyId), product);
    }
  });

  return lookup;
};

const createOrder = async (req, res) => {
  try {
    // Support two flows:
    // - Normal flow: use server-side Cart for authenticated users (cart from DB)
    // - Buy-now flow: client may POST `items` in body (productId, quantity). If provided, use them.

    const {
      fullname,
      phone,
      address,
      paymentMethod,
      discountCode = '',
      discountAmount = 0,
      items: bodyItems,
    } = req.body || {};

    let orderItems = [];
    let cart = null;

    if (Array.isArray(bodyItems) && bodyItems.length > 0) {
      // Use body items for buy-now or guest-provided items
      // Normalize items and try to resolve product references in DB when possible
      const productIds = bodyItems
        .map((it) => it.productId || it.product || it.id || it._id)
        .filter(Boolean);

      const existingProducts = productIds.length
        ? await resolveOrderProducts(productIds)
        : [];

      const productMap = buildProductLookup(existingProducts);

      for (const it of bodyItems) {
        const productId = it.productId || it.product || it.id || it._id;
        const quantity = Number(it.quantity) || 1;
        const product = productId ? productMap.get(String(productId)) : null;

        if (product) {
          orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity,
          });
        } else {
          throw new Error(`Sản phẩm không tồn tại khi tạo đơn hàng: ${productId || it.name || 'không xác định'}`);
        }
      }
    } else {
      // Default: use server-side cart
      cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
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

    const totalAmount = orderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

    // Validate and update stock only for items that have real product references
    const productIdsToUpdate = orderItems
      .filter((item) => item.product)
      .map((item) => item.product);

    const productsToUpdate = productIdsToUpdate.length
      ? await resolveOrderProducts(productIdsToUpdate)
      : [];

    const productLookup = buildProductLookup(productsToUpdate);

    for (const item of orderItems) {
      if (!item.product) continue;

      const product = productLookup.get(String(item.product));

      if (!product) {
        throw new Error('Sản phẩm không tồn tại khi tạo đơn hàng');
      }

      if (product.stock < item.quantity) {
        throw new Error(`Sản phẩm ${product.name} không đủ số lượng trong kho.`);
      }

      product.stock -= item.quantity;
      product.sold = (product.sold || 0) + item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      customerName: fullname || req.body?.fullname || req.user.name || req.user.fullname || req.user.email,
      customerEmail: req.body?.email || req.user.email || '',
      customerPhone: phone || req.user.phone || '',
      shippingAddress: address || req.user.address || '',
      paymentMethod: paymentMethod || 'cash',
      discountCode: String(discountCode || '').trim().toUpperCase(),
      discountAmount: Number(discountAmount) || 0,
      items: orderItems,
      totalAmount,
      status: 'pending',
    });

    // Clear server-side cart only if we used it
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
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi lấy lịch sử đơn hàng.',
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách đơn hàng.',
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
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
