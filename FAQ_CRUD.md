# FAQ - CRUD MongoDB Sync Fix

## Q1: Tại sao sản phẩm không cập nhật sau khi sửa?

**A:** Có 3 lý do chính:

1. **Frontend không gọi API PUT**
   - Fix: Đảm bảo `saveProductEdit()` resolve `_id` đúng trước khi gọi PUT

2. **Frontend gọi API nhưng API không cập nhật MongoDB**
   - Fix: `updateProduct()` backend phải tìm document đúng bằng `_id`
   - Nếu cách không tìm thấy _id, backend fallback tìm bằng field `id` (001, 002)

3. **Frontend cập nhật MongoDB nhưng sử dụng localStorage cũ**
   - Fix: Clear cache `localStorage.removeItem("products")` + `window.__productsCache = null`
   - Gọi `syncProductsFromServer()` để lấy data mới từ API

**Các bước được thực hiện:**
- ✅ Backend `updateProduct()`: Hỗ trợ cả _id và custom id
- ✅ Frontend `saveProductEdit()`: Resolve _id, gọi PUT, clear cache, sync
- ✅ Frontend `loadProducts()`: AWAIT sync trước render

---

## Q2: Tại sao xóa sản phẩm nó vẫn còn hiển thị?

**A:** Thường do 2 nguyên nhân:

1. **Xóa không thực sự xảy ra trên MongoDB**
   - Nguyên nhân: DELETE request không gửi đúng `_id` hoặc không có Authorization header
   - Fix: `resolveProductMongoId()` phải trả về _id thật (24 ký tự hex)
   - Backend `deleteProduct()` dùng `Product.deleteOne({ _id })`

2. **Xóa thành công nhưng frontend vẫn hiển thị cache cũ**
   - Nguyên nhân: localStorage có data cũ hoặc window.__productsCache chưa được clear
   - Fix: `deleteProductFromServer()` clear cache + `syncProductsFromServer()`

**Các bước được thực hiện:**
- ✅ Frontend `deleteProductFromServer()`: resolve _id, DELETE API, clear cache, sync
- ✅ Backend `deleteProduct()`: `Product.deleteOne({ _id: product._id })` + logs
- ✅ Frontend `syncProductsFromServer()`: Fetch GET /api/products, KHÔNG dùng localStorage fallback

---

## Q3: MongoDB _id là gì? Sao khác với id?

**A:**

| Thuộc tính | MongoDB _id | Custom id |
|-----------|-----------|----------|
| Định dạng | `507f1f77bcf86cd799439011` (24 hex) | `001`, `002`, `p123` (string bất kỳ) |
| Tự động tạo | ✅ Có (Mongoose tự sinh) | ❌ Không (do user set) |
| Duy nhất | ✅ Globally unique | ❌ Có thể trùng lặp nếu không cẩn thận |
| Dùng cho | Khóa chính MongoDB | Display, search, logic app |

**Vấn đề cũ:**
- Frontend gửi PUT /api/products/001 (custom id)
- Backend findById(001) không tìm thấy vì MongoDB lưu bằng _id
- Kết quả: 404 Not Found

**Giải pháp:**
- Frontend dùng `resolveProductMongoId('001')` → trả về `507f1f77...`
- Frontend gửi PUT /api/products/507f1f77...
- Backend findById(507f1f77...) tìm thấy ✅
- Kết quả: 200 OK

---

## Q4: Tại sao phải clear cache 3 lần?

**A:**

```javascript
// 1. window.__productsCache - In-memory cache của frontend
window.__productsCache = null;

// 2. localStorage "products" - Persistent storage
localStorage.removeItem('products');

// 3. localStorage "shopProducts" - Có thể dùng ở trang khác
localStorage.removeItem('shopProducts');

// 4. localStorage "cachedProducts" - Backup cache key
localStorage.removeItem('cachedProducts');
```

**Lý do:**
- Frontend có thể lưu cache ở nhiều nơi khác nhau
- Nếu chỉ clear 1 cái, những cái khác vẫn hiển thị data cũ
- Phải clear tất cả để đảm bảo lần tiếp theo `syncProductsFromServer()` fetch fresh data

---

## Q5: Khi nào dùng POST vs PUT?

**A:**

| Hoạt động | HTTP Method | URL | Body | Khi nào |
|---------|------------|-----|------|--------|
| Tạo mới | POST | `/api/products` | `{name, price, ...}` | Sản phẩm không tồn tại trên server |
| Cập nhật | PUT | `/api/products/:id` | `{name, price, ...}` | Sản phẩm đã tồn tại trên server |

**Logic trong code:**
```javascript
let actualProductId = await resolveProductMongoId(productId);

if (!actualProductId) {
  // Sản phẩm không tìm thấy trên server
  // → Tạo mới
  POST /api/products
} else {
  // Sản phẩm đã tồn tại
  // → Cập nhật
  PUT /api/products/:actualProductId
}
```

---

## Q6: Vì sao phải dùng Authorization header?

**A:**

```javascript
// DELETE/PUT/POST yêu cầu Authorization
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthHeaders().Authorization}` 
  // ^ Gửi token admin để backend xác thực
};

fetch(url, { 
  method: 'DELETE', 
  headers: headers  // Phải có Authorization
});
```

**Lý do:**
- Backend route có `auth, admin` middleware
- Kiểm tra: User đã login? User là admin?
- Nếu không gửi header → 401 Unauthorized
- Nếu gửi nhưng token hết hạn → 401 Unauthorized
- Nếu gửi nhưng user không admin → 403 Forbidden

---

## Q7: Làm sao biết product đã được delete thực sự?

**A:** Có 3 cách verify:

**1. Browser Console (Dễ nhất)**
```javascript
// Trước delete
console.log(getProductById('001')); 
// Output: {id: '001', name: '...', ...}

// Sau delete
console.log(getProductById('001'));
// Output: undefined (không tìm thấy)
```

**2. MongoDB Client (Chính xác nhất)**
```javascript
// Kết nối MongoDB trực tiếp
db.products.findOne({_id: ObjectId("507f1f77...")})
// Nếu null → đã delete
```

**3. Tab Ẩn Danh (Practical)**
- Xóa sản phẩm ở tab thường
- Mở tab ẩn danh (no cache)
- Refresh
- Nếu sản phẩm không xuất hiện → deleted ✅
- Nếu vẫn xuất hiện → deleted thất bại ❌

---

## Q8: Làm sao fix khi "Không thể lưu sản phẩm lên server"?

**A:** Bước troubleshoot:

1. **Check F12 Network**
   ```
   PUT /api/products/507f1f77... 
   Status: ??? (200, 404, 401, 500)
   ```
   - 404: MongoDB _id không tìm thấy
   - 401: Token hết hạn → logout/login lại
   - 500: Backend error → xem server console

2. **Check Request Body**
   ```json
   {
     "name": "...",
     "price": 200000,
     "category": "Áo",
     "description": "...",
     "stock": 10,
     "rating": 4.5,
     "sold": 0,
     "image": "..." (có thể là data:image/... base64)
   }
   ```
   - Tất cả fields có không?
   - image quá lớn? > 10MB = 413 error

3. **Check Authorization**
   - Network → PUT → Headers
   - `Authorization: Bearer eyJhbGc...` có không?
   - Token hợp lệ? Chưa expired?

4. **Forçe Retry**
   ```javascript
   // Logout
   logout();
   
   // Login lại
   // ... fill form ...
   
   // Retry save
   saveProductEdit(productId);
   ```

---

## Q9: Tại sao phải AWAIT syncProductsFromServer()?

**A:** Nếu không await:

```javascript
// ❌ WRONG - Không chờ sync hoàn thành
await deleteProductFromServer(productId);
renderProductTable();  // Chạy liền, data chưa update

// ✅ CORRECT - Chờ sync rồi render
await deleteProductFromServer(productId);
// deleteProductFromServer() đã await syncProductsFromServer() bên trong
// Nên đến đây, data đã updated
renderProductTable();  // Render data mới ✅
```

**Hoặc:**

```javascript
// ✅ CORRECT - Explicit await
await syncProductsFromServer();
const products = getAllProducts();  // Data mới ✅
renderProductTable(products);
```

---

## Q10: Có cách nào disable localStorage fallback?

**A:** Có, nhưng không khuyến khích:

```javascript
// ❌ RISKY - Nếu API down, không có fallback
function getAllProducts() {
  const cached = window.__productsCache;
  if (Array.isArray(cached)) {
    return cached;
  }
  // Không return getStoredProducts() (fallback)
  return [];  // Hiệu quả: không có sản phẩm nào
}

// ✅ SAFE - Hiện tại (cố gắng API, fallback localStorage)
function getAllProducts() {
  const cached = window.__productsCache;
  if (Array.isArray(cached)) {
    return cached;
  }
  if (window.__productsSyncStatus === 'success') {
    return [];  // API successful nhưng không có data
  }
  return getStoredProducts();  // Fallback nếu API failed/pending
}
```

**Reasoning:**
- Nếu server down tạm thời, user vẫn có thể xem sản phẩm từ cache
- Nhưng sau khi server OK, cache sẽ được update từ API
- Không bao giờ có data stale từ editing perspective (sửa sản phẩm vẫn sync đúng)

---

## Q11: File image Base64 bao lớn?

**A:** Size estimate:

| Format | Size Gốc | Base64 | Comment |
|--------|----------|--------|---------|
| JPEG 100x100 | ~5KB | ~7KB | ✅ Chuẩn |
| PNG 200x200 | ~50KB | ~67KB | ✅ Chuẩn |
| JPEG 500x500 | ~200KB | ~270KB | ⚠️ Chậm |
| PNG 1000x1000 | ~2MB | ~2.7MB | ⚠️ Nguy hiểm (> 10MB limit) |

**Server limit:**
```javascript
// backend/server.js
app.use(express.json({ limit: '10mb' }))  // Max 10MB request body
```

**Fix nếu ảnh quá lớn:**
1. Compress trước upload (cài thư viện như `sharp`)
2. Resize ảnh (max 500x500 pixels)
3. Chuyển JPEG (smaller) thay PNG (larger)

---

## Q12: Khác biệt giữa ReSync cách nào?

**A:**

| Cách | Code | Kết quả | Khi dùng |
|-----|------|--------|---------|
| A: Chỉ sync cache | `window.__productsCache = null; await syncProductsFromServer();` | Frontend update, MongoDB không thay đổi | Xem lại dữ liệu từ server |
| B: Clear cache + sync | `localStorage.clear(); window.__productsCache = null; await syncProductsFromServer();` | Frontend + localStorage reset, MongoDB không thay đổi | Reset toàn bộ (sau khi API update) |
| C: Reload page | `location.reload()` | Browser cache clear, lấy lại resources, call init | Full reset (nuclear option) |
| D: Redirect | `window.location.href = 'admin.html'` | Load trang mới từ đầu | After mutation thành công |

**Khuyến nghị:**
- Sau POST/PUT/DELETE: Dùng B (explicit clear) + redirect
- Sau GET: Dùng A (lightweight)
- Nếu stuck: Dùng C (reload page)
- Không khuyến khích D alone (mất context)

---

## Q13: Nếu gửi image quá lớn, sao xảy ra?

**A:**

```
Client: PUT /api/products/:id
Body: image (50MB base64 string)
        ↓
Server: app.use(express.json({ limit: '10mb' }))
        ↓
Response: 413 Payload Too Large
Message: "Request entity too large"

Frontend: catch error
Alert: "Không thể lưu sản phẩm lên server"
Console: 413 Response body
```

**Fix:**
1. Biar FileReader không load file > 10MB
2. Validate trước upload: `if (file.size > 5MB) alert('Quá lớn')`
3. Compress: Resize ảnh trước read

---

## Q14: Có cần update code giỏ hàng / checkout?

**A:** ❌ **KHÔNG cần**, vì:

1. Giỏ hàng dùng `productId` (001, 002, ..., hoặc _id)
2. Khi render giỏ, gọi `getProductById(productId)` → lấy tên/giá mới từ API
3. Không cần thay đổi logic

**VD:**
```javascript
// Giỏ hàng item: {productId: '001', quantity: 2}
// Checkout:
const product = getProductById('001');  // → data mới từ API ✅
const price = product.price;  // → giá cập nhật ✅
const total = price * 2;  // → tính toán đúng ✅
```

---

## Q15: Nếu 2 người sửa cùng sản phẩm?

**A:** Last write wins (cách phổ biến):

```
Person A: Edit product 001, tên → "V1"
Person B: Edit product 001, tên → "V2"
          ↓
A saves (PUT OK)
MongoDB now: "V1"
A's tab: redirects to admin, shows "V1" ✅
          ↓
B saves (PUT OK)
MongoDB now: "V2"  ← B's change overwrites A's
B's tab: redirects to admin, shows "V2" ✅
          ↓
A reloads admin
A sees "V2" (B's final update) ⚠️

Kết quả: B's value wins (last write)
```

**Solution nếu muốn conflict detection:**
- Thêm `version` field (optimistic locking)
- Kiểm tra version trước PUT
- Nếu mismatch → reject + "Someone else edited"

Nhưng cách này ngoài scope hiện tại (để sau).

---

## Q16: Nếu muốn undo delete?

**A:** ❌ Không thể, vì MongoDB delete là vĩnh viễn.

**Options:**
1. **Soft Delete** (sau này): Add `deleted_at` timestamp thay vì xóa
2. **Backup DB** (now): Backup MongoDB hàng ngày
3. **Restore từ backup** (if needed): Dừng app, restore DB, restart

Hiện tại không có undo, nên UI nên confirm trước delete:
```javascript
if (confirm('Xóa vĩnh viễn? Không thể hoàn tác!')) {
  await deleteProductFromServer(productId);
}
```

---

## Tóm tắt

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-----------|---------|
| Edits không sync | Cache cũ + API không gọi | Clear cache + syncProductsFromServer() |
| Delete không persist | API không thực sự xóa hoặc cache fallback | Dùng deleteOne(_id) + clear cache |
| Ảnh upload lỗi | Base64 quá lớn | Compress trước hoặc limit < 5MB |
| 401 lỗi | Token hết hạn | Logout + login |
| 404 lỗi | MongoDB _id sai | Resolve id → _id trước PUT/DELETE |
| Multiple edits conflict | Last write wins (MongoDB không có locking) | Implement optimistic locking (sau) |

---

**Còn câu hỏi?** Xem tại [FIX_CRUD_SUMMARY.md](FIX_CRUD_SUMMARY.md) hoặc [QUICK_TEST.md](QUICK_TEST.md)
