# Backend cho Website Bán Hàng Thời Trang

Đây là backend Node.js + Express kết nối MongoDB Atlas bằng mongoose. Cấu trúc backend rõ ràng, dễ đọc và phù hợp cho đề tài niên luận.

## Cấu trúc thư mục

- `server.js` - khởi tạo Express, cấu hình route và middleware.
- `config/db.js` - kết nối MongoDB Atlas.
- `models/` - định nghĩa schema dữ liệu.
- `controllers/` - xử lý logic cho từng phần.
- `routes/` - khai báo API RESTful.
- `middleware/` - xác thực JWT và xử lý lỗi.
- `utils/` - helper tạo token JWT.

## Cài đặt và chạy backend

1. Vào thư mục backend:
   ```powershell
   cd "c:\Niên luận hk3\backend"
   ```
2. Cài thư viện:
   ```powershell
   npm install
   ```
3. Tạo file `.env` từ `.env.example`:
   ```powershell
   copy .env.example .env
   ```
4. Chỉnh sửa `.env` với thông tin của bạn:
   - `MONGO_URI` - đường dẫn MongoDB Atlas.
   - `JWT_SECRET` - khóa bí mật tạo token.
   - `ADMIN_EMAIL` - email đăng ký sẽ được cấp quyền admin.
5. Chạy backend:
   ```powershell
   npm start
   ```

## API chính

- `POST /api/auth/register` - đăng ký tài khoản.
- `POST /api/auth/login` - đăng nhập.
- `GET /api/auth/me` - lấy thông tin user hiện tại.
- `GET /api/products` - lấy danh sách sản phẩm.
- `GET /api/products/:id` - lấy chi tiết sản phẩm.
- `POST /api/products` - tạo sản phẩm (admin).
- `PUT /api/products/:id` - cập nhật sản phẩm (admin).
- `DELETE /api/products/:id` - xóa sản phẩm (admin).
- `GET /api/cart` - xem giỏ hàng.
- `POST /api/cart` - thêm sản phẩm vào giỏ hàng.
- `PUT /api/cart/:productId` - cập nhật số lượng sản phẩm.
- `DELETE /api/cart/:productId` - xóa sản phẩm khỏi giỏ hàng.
- `POST /api/orders` - tạo đơn hàng từ giỏ hàng.
- `GET /api/orders/my` - lịch sử đơn hàng user.
- `GET /api/orders/:id` - chi tiết đơn hàng.
- `GET /api/admin/users` - xem tất cả users (admin).
- `GET /api/admin/products` - xem tất cả products (admin).
- `GET /api/admin/orders` - xem tất cả orders (admin).
- `GET /api/admin/stats` - xem thống kê doanh thu (admin).

## Test API bằng Postman

1. Chạy server bằng `npm start`.
2. Gửi request `POST /api/auth/register` với body JSON:
   ```json
   {
     "name": "Nguyen Van A",
     "email": "admin@example.com",
     "password": "123456"
   }
   ```
3. Lấy token từ response và thêm header sau cho request tiếp theo:
   - `Authorization: Bearer <token>`
4. Gửi request `POST /api/products` để tạo sản phẩm (yêu cầu admin).
5. Gửi request `GET /api/products` để lấy danh sách sản phẩm.

## Mô tả file

- `server.js`: chạy server và đăng ký route.
- `config/db.js`: kết nối MongoDB bằng `process.env.MONGO_URI`.
- `models/User.js`: thông tin user, password mã hóa, role admin hoặc user.
- `models/Product.js`: thông tin sản phẩm.
- `models/Cart.js`: giỏ hàng cho mỗi user.
- `models/Order.js`: đơn hàng đã mua.
- `controllers/authController.js`: xử lý đăng ký, đăng nhập, lấy user.
- `controllers/productController.js`: CRUD sản phẩm.
- `controllers/cartController.js`: thêm/xóa/cập nhật giỏ hàng.
- `controllers/orderController.js`: tạo đơn hàng và xem lịch sử.
- `controllers/adminController.js`: dashboard admin.
- `middleware/authMiddleware.js`: xác thực JWT và phân quyền admin.
- `middleware/errorMiddleware.js`: xử lý lỗi và route không tồn tại.
