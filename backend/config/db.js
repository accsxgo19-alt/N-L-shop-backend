const mongoose = require('mongoose');

// Kết nối đến MongoDB bằng mongoose
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI chưa được cấu hình trong .env');
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('MongoDB connected successfully');
};

module.exports = connectDB;
