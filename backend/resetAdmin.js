require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

async function resetAdmin() {
  try {
    await connectDB();
    
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const newPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await User.updateOne(
      { email: adminEmail },
      {
        $set: {
          name: "Administrator",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
        },
      },
      { upsert: true }
    );

    console.log(`✅ Thành công! Đã thiết lập tài khoản Admin: ${adminEmail}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Reset admin error:", error.message);
    process.exit(1);
  }
}

resetAdmin();