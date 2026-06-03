const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/Cart');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { checkoutLimiter } = require('./middleware/security');
const { validateCheckout } = require('./middleware/validator');

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  })
);

// Serve frontend static files from the `nl1` directory
app.use(express.static(path.join(__dirname, 'nl1')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'nl1', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.send('OK');
});

// Checkout route
app.post('/api/checkout', checkoutLimiter, validateCheckout, async (req, res) => {
  try {
    const {
      fullname,
      phone,
      address,
      email,
      paymentMethod,
      items,
      discountCode = '',
      discountAmount = 0,
    } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const cartItems = Array.isArray(items) ? items : [];

    const products = await Product.find({
      _id: { $in: cartItems.map((item) => item.productId) },
    });

    if (products.length !== cartItems.length) {
      return res.status(400).json({
        message: 'Một số sản phẩm trong giỏ hàng không tồn tại.',
      });
    }

    const orderItems = cartItems.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);

      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    for (const item of orderItems) {
      const product = products.find(
        (p) => p._id.toString() === item.product.toString()
      );

      if (!product) {
        return res.status(400).json({
          message: `Sản phẩm không tồn tại: ${item.name}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Số lượng không đủ cho sản phẩm ${product.name}`,
        });
      }
    }

    const orderTotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await Promise.all(
      products.map((product) => {
        const item = cartItems.find(
          (i) => i.productId === product._id.toString()
        );

        if (item) {
          product.stock -= item.quantity;
          product.sold = (product.sold || 0) + item.quantity;
          return product.save();
        }

        return Promise.resolve();
      })
    );

    const existingUser = await User.findOne({ email: normalizedEmail });

    const order = await Order.create({
      user: existingUser ? existingUser._id : undefined,
      customerName: fullname,
      customerEmail: normalizedEmail,
      customerPhone: phone,
      shippingAddress: address,
      paymentMethod,
      discountCode: String(discountCode || '').trim().toUpperCase(),
      discountAmount: Number(discountAmount) || 0,
      items: orderItems,
      totalAmount: orderTotal,
      status: 'pending',
    });

    // If user exists, clear their cart
    if (existingUser) {
      try {
        await Cart.findOneAndUpdate(
          { user: existingUser._id },
          { items: [] }
        );
      } catch (error) {
        console.error('Failed to clear cart after checkout:', error);
      }
    }

    // Emit realtime events if Socket.IO is available
    try {
      const io = app.locals.io;

      if (io) {
        if (existingUser) {
          io.to(String(existingUser._id)).emit('orderCreated', order);
        }

        io.to('admins').emit('newOrder', order);
      }
    } catch (error) {
      console.error('Emit order events failed:', error);
    }

    res.status(201).json({
      message: 'Tạo đơn hàng thành công.',
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi tạo đơn hàng.',
    });
  }
});

// Frontend fallback must be placed AFTER all real routes
// and BEFORE notFound/errorHandler.
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  return res.sendFile(path.join(__dirname, 'nl1', 'index.html'));
});

// Error middleware must be last
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      },
    });

    // Simple socket auth using JWT passed in handshake auth or query
    io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token || socket.handshake.query?.token;

        if (!token) {
          return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        socket.user = {
          id: decoded.id || decoded.sub,
          role: decoded.role,
        };

        return next();
      } catch (error) {
        return next();
      }
    });

    io.on('connection', (socket) => {
      if (socket.user && socket.user.id) {
        socket.join(String(socket.user.id));

        if (socket.user.role === 'admin') {
          socket.join('admins');
        }
      }

      socket.on('disconnect', () => {
        // No-op for now
      });
    });

    // Make io available to controllers via app.locals
    app.locals.io = io;

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Khởi động server thất bại:', error);
    process.exit(1);
  }
};

startServer();