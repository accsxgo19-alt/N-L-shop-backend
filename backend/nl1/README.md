# N&L Shop - Trang Web Bán Hàng Thời Trang Online

Một trang web bán hàng thời trang hoàn chỉnh với đầy đủ chức năng được xây dựng bằng HTML, CSS và JavaScript.

## ✨ Các Tính Năng

### 1. **Đăng Ký & Đăng Nhập**
- Tạo tài khoản mới với email, mật khẩu, họ tên, số điện thoại, địa chỉ
- Đăng nhập với email và mật khẩu
- Quản lý phiên đăng nhập

### 2. **Danh Mục Sản Phẩm**
- 15 sản phẩm thời trang đa dạng (Áo, Quần, Váy, Giày, Phụ kiện)
- Xem thông tin chi tiết sản phẩm
- Hiển thị đánh giá sao
- Xem giá sản phẩm

### 3. **Tìm Kiếm & Lọc**
- Tìm kiếm sản phẩm theo tên
- Lọc theo danh mục
- Cập nhật kết quả tìm kiếm real-time

### 4. **Giỏ Hàng**
- Thêm sản phẩm vào giỏ hàng
- Cập nhật số lượng sản phẩm (tăng/giảm)
- Xóa sản phẩm khỏi giỏ hàng
- Hiển thị tổng tiền hàng
- Tính toán phí vận chuyển (miễn phí nếu > 500.000đ)
- Tính toán thuế (10% trên tổng tiền hàng)
- Hiển thị tổng cộng

### 5. **Thanh Toán & Đặt Hàng**
- Nhập thông tin khách hàng (họ tên, SĐT, địa chỉ, email)
- Lựa chọn phương thức thanh toán (COD hoặc chuyển khoản)
- Xem tóm tắt đơn hàng trước khi đặt
- Tạo đơn hàng và nhận mã đơn hàng

### 6. **Quản Lý Đơn Hàng**
- Xem danh sách đơn hàng của bạn
- Xem trạng thái đơn hàng (Chờ xác nhận, Đang xử lý, Đã gửi, Đã giao, Đã hủy)
- Xem chi tiết sản phẩm trong đơn hàng
- Xem tổng tiền mỗi đơn

### 7. **Tài Khoản Cá Nhân**
- Cập nhật thông tin tài khoản (họ tên, SĐT, địa chỉ)
- Thay đổi mật khẩu
- Xem thông tin email (không thể thay đổi)

### 8. **Giao Diện Responsive**
- Tương thích với desktop, tablet, mobile
- Thiết kế hiện đại với màu sắc nổi bật
- Trải nghiệm người dùng mượt mà

## 📁 Cấu Trúc Tập Tin

```
nl1/
├── index.html           # Trang chủ - hiển thị danh sách sản phẩm
├── login.html            # Trang đăng nhập
├── register.html        # Trang đăng ký
├── cart.html            # Trang giỏ hàng
├── checkout.html        # Trang thanh toán
├── orders.html          # Trang xem đơn hàng
├── account.html         # Trang quản lý tài khoản
├── style.css            # Toàn bộ CSS styling
└── main.js              # Toàn bộ JavaScript functionality
```

## 🚀 Cách Sử Dụng

### Mở Trang Web
1. Mở file `index.html` trong trình duyệt web
2. Hoặc sử dụng Live Server extension trong VS Code

### Tài Khoản Demo
- **Email:** demo@fashionshop.com
- **Mật khẩu:** 123456

### Quy Trình Mua Hàng
1. **Duyệt sản phẩm** - Từ trang chủ, xem tất cả các sản phẩm
2. **Tìm kiếm** - Sử dụng thanh tìm kiếm để tìm sản phẩm cụ thể
3. **Thêm vào giỏ** - Click "Thêm vào giỏ" trên sản phẩm mong muốn
4. **Xem giỏ hàng** - Click biểu tượng giỏ hàng để xem chi tiết
5. **Cập nhật số lượng** - Thay đổi số lượng sản phẩm nếu cần
6. **Thanh toán** - Click "Thanh toán" để tiến hành thanh toán
7. **Đăng ký/Đăng nhập** - Tạo tài khoản hoặc đăng nhập (nếu chưa)
8. **Nhập thông tin giao hàng** - Điền đầy đủ thông tin
9. **Chọn phương thức thanh toán** - Chọn COD hoặc chuyển khoản
10. **Đặt hàng** - Hoàn tất đơn hàng
11. **Xem đơn hàng** - Đi đến "Đơn hàng" để xem lịch sử mua

## 💾 Lưu Trữ Dữ Liệu

- Tất cả dữ liệu được lưu trong **localStorage** của trình duyệt
- Dữ liệu được bảo lưu khi bạn đóng/mở lại trình duyệt
- **Xóa dữ liệu:** Xóa lịch sử duyệt web trong cài đặt trình duyệt

## 🎨 Các Sản Phẩm Có Sẵn

1. **Áo Thun Basic** - 150.000đ
2. **Áo Sơ Mi Nam** - 280.000đ
3. **Áo Len Nữ** - 320.000đ
4. **Quần Jeans Xanh** - 350.000đ
5. **Quần Tây Nam** - 280.000đ
6. **Quần Legging Nữ** - 200.000đ
7. **Váy Hoa Nữ** - 380.000đ
8. **Váy Xếp Li** - 320.000đ
9. **Giày Sneaker Trắng** - 450.000đ
10. **Giày Cao Gót** - 380.000đ
11. **Dép Nữ** - 180.000đ
12. **Túi Xách** - 550.000đ
13. **Ví Da Nam** - 320.000đ
14. **Mũ Lưỡi Trai** - 120.000đ
15. **Dây Chuyền Vàng** - 280.000đ

## 💳 Phương Thức Thanh Toán

- **COD (Thanh toán khi nhận hàng)** - Mặc định
- **Chuyển khoản** - Tùy chọn thay thế

## 📊 Tính Toán Giá

- **Phí vận chuyển:** 50.000đ (miễn phí nếu > 500.000đ)
- **Thuế:** 10% trên tổng tiền hàng
- **Tổng cộng:** Tiền hàng + Phí vận chuyển + Thuế

## 🔒 Bảo Mật

- Mật khẩu được lưu trữ cục bộ (trong tình huống thực tế, cần mã hóa)
- Chỉ hiển thị thông tin cá nhân của người dùng đã đăng nhập
- Tự động cập nhật trạng thái khi đăng nhập/đăng xuất

## 📱 Responsive Design

- **Desktop:** Tối ưu cho màn hình lớn
- **Tablet:** Bố cục thích nghi với tablet
- **Mobile:** Giao diện dành riêng cho thiết bị di động

## 🛠️ Công Nghệ Sử Dụng

- **HTML5** - Cấu trúc trang web
- **CSS3** - Styling và responsive design
- **JavaScript (Vanilla)** - Toàn bộ logic ứng dụng
- **LocalStorage API** - Lưu trữ dữ liệu cục bộ

## 📝 Ghi Chú

- Dự án này sử dụng localStorage, không cần máy chủ backend
- Dữ liệu được lưu trong trình duyệt và sẽ mất nếu xóa lịch sử duyệt
- Thích hợp cho mục đích học tập, demo, hoặc prototype
- Có thể dễ dàng tích hợp với backend API trong tương lai

## 🎯 Tính Năng Nâng Cao (Có Thể Thêm Sau)

- Tích hợp thanh toán online (Stripe, VNPay)
- Backend API với cơ sở dữ liệu
- Gửi email xác nhận đơn hàng
- Hệ thống đánh giá sản phẩm từ người dùng
- Mã giảm giá/Voucher
- Lịch sử xem sản phẩm
- Danh sách yêu thích

---

**Tác giả:** N&L Shop Development Team
**Phiên bản:** 1.0
**Ngày cập nhật:** 2024
