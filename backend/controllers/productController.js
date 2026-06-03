const mongoose = require('mongoose');
const Product = require('../models/Product');

const createProduct = async (req, res) => {
  try {
    const { name, image, price, category, description, stock, rating, sold } = req.body;

    if (!name || price == null || !category || !description || stock == null) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin sản phẩm.' });
    }

    const product = await Product.create({
      name,
      image,
      price,
      category,
      description,
      stock,
      rating: rating != null ? Number(rating) : 0,
      sold: sold != null ? Number(sold) : 0,
    });

    res.status(201).json({ message: 'Tạo sản phẩm thành công.', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi tạo sản phẩm.' });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách sản phẩm.' });
  }
};

const getProductById = async (req, res) => {
  try {
    const requestedId = String(req.params.id || '').trim();
    let product = null;

    if (mongoose.isValidObjectId(requestedId)) {
      product = await Product.findById(requestedId);
    }

    if (!product) {
      product = await Product.findOne({ id: requestedId });
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
    const requestedId = String(req.params.id || '').trim();
    const { name, image, price, category, description, stock, rating, sold } = req.body;

    let product = null;
    if (mongoose.isValidObjectId(requestedId)) {
      product = await Product.findById(requestedId);
    }

    if (!product) {
      product = await Product.findOne({ id: requestedId });
    }

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy.' });
    }

    product.name = name ?? product.name;
    product.image = image ?? product.image;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.description = description ?? product.description;
    product.stock = stock ?? product.stock;
    product.rating = rating != null ? Number(rating) : product.rating;
    product.sold = sold != null ? Number(sold) : product.sold;

    await product.save();
    res.json({ message: 'Cập nhật sản phẩm thành công.', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật sản phẩm.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const requestedId = String(req.params.id || '').trim();
    let product = null;

    if (mongoose.isValidObjectId(requestedId)) {
      product = await Product.findById(requestedId);
    }

    if (!product) {
      product = await Product.findOne({ id: requestedId });
    }

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy.' });
    }

    await product.deleteOne();
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
