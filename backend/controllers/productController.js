const mongoose = require('mongoose');
const Product = require('../models/Product');

const createProduct = async (req, res) => {
  try {
    const { id, name, image, price, category, description, stock, rating, sold } = req.body;

    if (!name || price == null || !category || !description || !image) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin sản phẩm.' });
    }

    const product = await Product.create({
      id: id || undefined,
      name,
      image,
      price: Number(price),
      category,
      description,
      stock: stock != null ? Number(stock) : 10,
      rating: rating != null ? Number(rating) : 0,
      sold: sold != null ? Number(sold) : 0,
    });

    res.status(201).json({ message: 'Tạo sản phẩm thành công.', product });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dữ liệu sản phẩm không hợp lệ.' });
    }
    res.status(500).json({ message: 'Lỗi server khi tạo sản phẩm.' });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách sản phẩm.' });
  }
};

const getProductById = async (req, res) => {
  try {
    let product = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id);
    }
    if (!product) {
      product = await Product.findOne({ id: req.params.id });
    }
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy.' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết sản phẩm.' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, image, price, category, description, stock, rating, sold, id } = req.body;
    let product = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id);
    }
    if (!product) {
      product = await Product.findOne({ id: req.params.id });
    }

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy.' });
    }

    product.id = id ?? product.id;
    product.name = name ?? product.name;
    product.image = image ?? product.image;
    product.price = (price != null) ? Number(price) : product.price;
    product.category = category ?? product.category;
    product.description = description ?? product.description;
    product.stock = (stock != null) ? Number(stock) : (product.stock != null ? product.stock : 10);
    product.rating = (rating != null) ? Number(rating) : (product.rating != null ? product.rating : 0);
    product.sold = (sold != null) ? Number(sold) : (product.sold != null ? product.sold : 0);

    await product.save();
    res.json({ message: 'Cập nhật sản phẩm thành công.', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật sản phẩm.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const incomingId = req.params.id;
    console.log('Delete product request for id:', incomingId);
    let product = null;
    if (mongoose.Types.ObjectId.isValid(incomingId)) {
      product = await Product.findById(incomingId);
    }
    if (!product) {
      product = await Product.findOne({ id: incomingId });
    }
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy.' });
    }

    const deleted = await Product.deleteOne({ _id: product._id });
    console.log('Deleted product result:', deleted);
    res.json({ message: 'Xóa sản phẩm thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm.' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
