/**
 * Seed products from main.js to MongoDB Atlas
 *
 * Cách chạy:
 * node seedProducts.js
 *
 * Yêu cầu:
 * - File này đặt trong thư mục backend
 * - backend/.env phải có MONGO_URI
 */

const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");
const connectDB = require("./config/db");

const products = [
  {
    name: 'Áo Thun Basic',
    category: 'Áo',
    price: 150000,
    image: 'img/aothun2.jpg',
    rating: 4.5,
    sold: 320,
    stock: 50,
    createdAt: new Date('2024-05-20'),
    description: 'Áo thun trắng basic chất lượng cao'
  },
  {
    name: 'Áo Sơ Mi Nam',
    category: 'Áo',
    price: 280000,
    image: 'img/aosomi1.ppg',
    rating: 4.8,
    sold: 210,
    stock: 45,
    createdAt: new Date('2024-04-15'),
    description: 'Áo sơ mi nam kiểu dáng hiện đại'
  },
  {
    name: 'Áo Len Nữ',
    category: 'Áo',
    price: 320000,
    image: '🧥',
    rating: 4.6,
    sold: 410,
    stock: 35,
    createdAt: new Date('2024-06-10'),
    description: 'Áo len nữ ấm áp mùa đông'
  },
  {
    name: 'Quần Jeans Xanh',
    category: 'Quần',
    price: 350000,
    image: '👖',
    rating: 4.7,
    sold: 190,
    stock: 40,
    createdAt: new Date('2024-03-08'),
    description: 'Quần jeans xanh đen cơ bản'
  },
  {
    name: 'Quần Tây Nam',
    category: 'Quần',
    price: 280000,
    image: '👔',
    rating: 4.5,
    sold: 270,
    stock: 30,
    createdAt: new Date('2024-05-05'),
    description: 'Quần tây nam chất liệu cao cấp'
  },
  {
    name: 'Quần Legging Nữ',
    category: 'Quần',
    price: 200000,
    image: '🩳',
    rating: 4.9,
    sold: 450,
    stock: 55,
    createdAt: new Date('2024-06-12'),
    description: 'Quần legging co giãn thoải mái'
  },
  {
    name: 'Váy Hoa Nữ',
    category: 'Váy',
    price: 380000,
    image: '👗',
    rating: 4.8,
    sold: 380,
    stock: 25,
    createdAt: new Date('2024-06-07'),
    description: 'Váy hoa vintage hè 2024'
  },
  {
    name: 'Váy Xếp Li',
    category: 'Váy',
    price: 320000,
    image: '👗',
    rating: 4.6,
    sold: 265,
    stock: 28,
    createdAt: new Date('2024-04-29'),
    description: 'Váy xếp li trắng sang trọng'
  },
  {
    name: 'Giày Sneaker Trắng',
    category: 'Giày',
    price: 450000,
    image: '👟',
    rating: 4.9,
    sold: 520,
    stock: 60,
    createdAt: new Date('2024-05-28'),
    description: 'Giày sneaker trắng thoáng khí'
  },
  {
    name: 'Giày Cao Gót',
    category: 'Giày',
    price: 380000,
    image: '👠',
    rating: 4.7,
    sold: 330,
    stock: 32,
    createdAt: new Date('2024-05-22'),
    description: 'Giày cao gót đen thanh lịch'
  },
  {
    name: 'Dép Nữ',
    category: 'Giày',
    price: 180000,
    image: '👡',
    rating: 4.5,
    sold: 145,
    stock: 38,
    createdAt: new Date('2024-05-29'),
    description: 'Dép nữ đi nhà thoải mái'
  },
  {
    name: 'Túi Xách',
    category: 'Phụ kiện',
    price: 550000,
    image: '👜',
    rating: 4.8,
    sold: 295,
    stock: 20,
    createdAt: new Date('2024-06-02'),
    description: 'Túi xách nữ da thật'
  },
  {
    name: 'Ví Da Nam',
    category: 'Phụ kiện',
    price: 320000,
    image: '🎒',
    rating: 4.6,
    sold: 220,
    stock: 34,
    createdAt: new Date('2024-04-18'),
    description: 'Ví da nam cao cấp'
  },
  {
    name: 'Mũ Lưỡi Trai',
    category: 'Phụ kiện',
    price: 120000,
    image: '🧢',
    rating: 4.4,
    sold: 125,
    stock: 70,
    createdAt: new Date('2024-06-14'),
    description: 'Mũ lưỡi trai nam nữ'
  },
  {
    name: 'Dây Chuyền Vàng',
    category: 'Phụ kiện',
    price: 280000,
    image: '⛓️',
    rating: 4.7,
    sold: 205,
    stock: 22,
    createdAt: new Date('2024-05-12'),
    description: 'Dây chuyền vàng tinh tế'
  }
];
async function seedProducts() {
  try {
    await connectDB();
    await Product.deleteMany();
    await Product.insertMany(products);
    
    console.log("\n=== SEED PRODUCTS COMPLETE ===");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed products error:", error);
    process.exit(1);
  }
}

seedProducts();