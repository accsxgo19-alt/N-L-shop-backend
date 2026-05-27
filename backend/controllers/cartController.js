const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }

    const items = cart.items.map((item) => ({
      id: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    res.json({ items, totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng.' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Vui lòng cung cấp productId và quantity.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true }
    );

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    // emit realtime cart update to the user if socket.io is available
    try {
      const io = req.app.locals.io;
      if (io) {
        const items = cart.items.map((item) => ({
          id: item.product._id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        }));
        const totalAmount = items.reduce((sum, it) => sum + it.subtotal, 0);
        io.to(String(req.user._id)).emit('cartUpdated', { items, totalAmount });
      }
    } catch (e) {
      console.error('Emit cart update failed', e);
    }

    res.status(201).json({ message: 'Đã thêm vào giỏ hàng.', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi thêm sản phẩm vào giỏ hàng.' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity == null) {
      return res.status(400).json({ message: 'Vui lòng cung cấp quantity.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại.' });
    }

    const item = cart.items.find((item) => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng.' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    try {
      const io = req.app.locals.io;
      if (io) {
        const items = cart.items.map((item) => ({
          id: item.product._id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        }));
        const totalAmount = items.reduce((sum, it) => sum + it.subtotal, 0);
        io.to(String(req.user._id)).emit('cartUpdated', { items, totalAmount });
      }
    } catch (e) {
      console.error('Emit cart update failed', e);
    }

    res.json({ message: 'Cập nhật giỏ hàng thành công.', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng.' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại.' });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng.' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    try {
      const io = req.app.locals.io;
      if (io) {
        const items = cart.items.map((item) => ({
          id: item.product._id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        }));
        const totalAmount = items.reduce((sum, it) => sum + it.subtotal, 0);
        io.to(String(req.user._id)).emit('cartUpdated', { items, totalAmount });
      }
    } catch (e) {
      console.error('Emit cart update failed', e);
    }

    res.json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công.', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng.' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
