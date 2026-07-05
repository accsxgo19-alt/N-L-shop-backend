const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const LEGACY_PRODUCT_ID_ALIASES = {
  '001': 'Ao Thun Basic',
  '002': 'Ao So Mi Nam',
  '003': 'Ao Len Nu',
  '004': 'Quan Jeans Xanh',
  '005': 'Quan Tay Nam',
  '006': 'Quan Legging Nu',
  '007': 'Vay Hoa Nu',
  '008': 'Vay Xep Li',
  '009': 'Giay Sneaker Trang',
  '010': 'Giay Cao Got',
  '011': 'Dep Nu',
  '012': 'Tui Xach',
  '013': 'Vi Da Nam',
  '014': 'Mu Luoi Trai',
  '015': 'Day Chuyen Vang',
};

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const findProductByAnyId = async (productId) => {
  const normalizedId = String(productId || '').trim();

  if (!normalizedId) return null;

  if (mongoose.Types.ObjectId.isValid(normalizedId)) {
    const product = await Product.findById(normalizedId);
    if (product) return product;
  }

  const directProduct = await Product.findOne({ id: normalizedId });
  if (directProduct) return directProduct;

  const aliasName = LEGACY_PRODUCT_ID_ALIASES[normalizedId];
  if (!aliasName) return null;

  const products = await Product.find({});
  const normalizedAlias = normalizeText(aliasName);
  const sortedProducts = products.slice().sort((a, b) => String(a._id).localeCompare(String(b._id)));
  const byLegacyOrder = sortedProducts[Number(normalizedId) - 1];

  return products.find((product) => normalizeText(product.name) === normalizedAlias) || byLegacyOrder || null;
};

const serializeCart = async (cart) => {
  const populatedCart = await cart.populate('items.product');
  const items = populatedCart.items
    .filter((item) => item.product)
    .map((item) => ({
      id: String(item.product._id),
      productId: String(item.product._id),
      legacyId: item.product.id || '',
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { items, totalAmount };
};

const emitCartUpdated = (req, cartPayload) => {
  try {
    const io = req.app.locals.io;
    if (io) {
      io.to(String(req.user._id)).emit('cartUpdated', cartPayload);
    }
  } catch (error) {
    console.error('Emit cart update failed', error);
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }

    return res.json(await serializeCart(cart));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Loi khi lay gio hang.' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const normalizedQuantity = Number(quantity) || 0;

    if (!productId || normalizedQuantity < 1) {
      return res.status(400).json({ message: 'Vui long cung cap productId va quantity hop le.' });
    }

    const product = await findProductByAnyId(productId);
    if (!product) {
      return res.status(404).json({ message: 'San pham khong ton tai.' });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true }
    );

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === product._id.toString());
    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += normalizedQuantity;
    } else {
      cart.items.push({ product: product._id, quantity: normalizedQuantity });
    }

    await cart.save();
    const cartPayload = await serializeCart(cart);
    emitCartUpdated(req, cartPayload);

    return res.status(201).json({ message: 'Da them vao gio hang.', cart: cartPayload });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Loi khi them san pham vao gio hang.' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity == null) {
      return res.status(400).json({ message: 'Vui long cung cap quantity.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Gio hang khong ton tai.' });
    }

    const product = await findProductByAnyId(productId);
    if (!product) {
      return res.status(404).json({ message: 'San pham khong ton tai.' });
    }

    const item = cart.items.find((cartItem) => cartItem.product.toString() === product._id.toString());
    if (!item) {
      return res.status(404).json({ message: 'San pham khong ton tai trong gio hang.' });
    }

    const normalizedQuantity = Number(quantity) || 0;
    if (normalizedQuantity <= 0) {
      cart.items = cart.items.filter((cartItem) => cartItem.product.toString() !== product._id.toString());
    } else {
      item.quantity = normalizedQuantity;
    }

    await cart.save();
    const cartPayload = await serializeCart(cart);
    emitCartUpdated(req, cartPayload);

    return res.json({ message: 'Cap nhat gio hang thanh cong.', cart: cartPayload });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Loi khi cap nhat gio hang.' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Gio hang khong ton tai.' });
    }

    const product = await findProductByAnyId(productId);
    if (!product) {
      return res.status(404).json({ message: 'San pham khong ton tai.' });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === product._id.toString());
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'San pham khong ton tai trong gio hang.' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    const cartPayload = await serializeCart(cart);
    emitCartUpdated(req, cartPayload);

    return res.json({ message: 'Xoa san pham khoi gio hang thanh cong.', cart: cartPayload });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Loi khi xoa san pham khoi gio hang.' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
