# 🧪 TEST PLAN: Product Add/Edit/Delete Cache Fix

## Pre-Test Setup

### Environment Check
```javascript
// Run in F12 Console on any page:
console.log({
  API_BASE: typeof API_BASE !== 'undefined' ? API_BASE : 'UNDEFINED',
  isAdmin: isAdmin() ? 'YES' : 'NO',
  userToken: getCurrentUserToken() ? 'OK' : 'MISSING'
});
```

**Expected Output:**
```javascript
{
  API_BASE: "http://localhost:5000",
  isAdmin: "YES",
  userToken: "OK"
}
```

---

## ✅ TEST 1: Add New Product - Persistence Check

**Duration:** 5 minutes  
**Goal:** Verify new product persists across page reload and tab switch

### Steps:

**1.1 Prepare Admin Page**
- [ ] Open http://localhost:5000/backend/nl1/admin.html
- [ ] Ensure logged in as Admin
- [ ] F12 → Network tab (check all requests)

**1.2 Clear Cache First**
```javascript
// Run in console:
clearAllProductsCache();
syncProductsFromServer().then(() => {
  console.log('Cache cleared and synced');
  console.log('Product count:', window.__productsCache?.length);
});
```
- [ ] Wait for "Cache cleared and synced" message
- [ ] Note down product count (e.g., "Product count: 17")

**1.3 Add Test Product**
- [ ] Scroll to "Thêm sản phẩm mới" form
- [ ] Fill in:
  - [ ] Tên sản phẩm: `TEST_PRODUCT_001`
  - [ ] Danh mục: `Áo`
  - [ ] Giá: `123456`
  - [ ] Mô tả: `This is a test product for cache fix`
  - [ ] Số lượng: `10`
  - [ ] Upload ảnh: Select any image file
- [ ] Click "Lưu sản phẩm"
- [ ] Should see: "Thêm sản phẩm mới thành công."

**1.4 Check F12 Network**
- [ ] Find POST request to `/api/products`
- [ ] Check: **Status should be 201** ✓
- [ ] Check Response body contains your product data
- [ ] Example Response:
  ```json
  {
    "message": "Tạo sản phẩm thành công.",
    "product": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "TEST_PRODUCT_001",
      "price": 123456,
      "category": "Áo",
      ...
    }
  }
  ```

**1.5 Verify Admin Table**
- [ ] Scroll down to "Danh sách sản phẩm"
- [ ] Should see `TEST_PRODUCT_001` in table
- [ ] Price shows: 123,456đ ✓

**1.6 Check sessionStorage Cache Cleared**
```javascript
// Run in console:
console.log('sessionStorage homepageProductsCache:', 
  sessionStorage.getItem('homepageProductsCache'));
```
- [ ] Should output: `null` ✓
- [ ] If not null, check the timestamp:
  ```javascript
  const cache = JSON.parse(sessionStorage.getItem('homepageProductsCache'));
  console.log('Cache age (ms):', Date.now() - cache.timestamp);
  ```

**1.7 Navigate to Index (Home Page)**
- [ ] Open new tab or navigate to http://localhost:5000/backend/nl1/
- [ ] **IMMEDIATELY** look for `TEST_PRODUCT_001` in products grid
- [ ] ✅ Should be visible

**1.8 Wait 2 Seconds - Persistence Check**
- [ ] Page stays on index
- [ ] Wait 2-3 seconds
- [ ] ✅ `TEST_PRODUCT_001` should STILL be visible (not disappear!)

**1.9 Reload Page - Hard Refresh Check**
- [ ] Press Ctrl+Shift+R (hard refresh, clear cache)
- [ ] ✅ `TEST_PRODUCT_001` should still appear

**1.10 Incognito Tab - Database Check**
- [ ] Open new Incognito/Private tab
- [ ] Navigate to http://localhost:5000/backend/nl1/
- [ ] Login as customer
- [ ] ✅ `TEST_PRODUCT_001` should appear (confirms MongoDB has it)

**✅ TEST 1 PASSED if all above steps succeed**

---

## ✅ TEST 2: Edit Product - Persistence Check

**Duration:** 5 minutes  
**Goal:** Verify edited product persists

### Steps:

**2.1 Find Editable Product**
- [ ] Index page: Find `TEST_PRODUCT_001` (from Test 1)
- [ ] Click product card (or Admin → Edit product)
- [ ] Goes to product detail page

**2.2 Click Edit Button**
- [ ] Look for "Chỉnh sửa" or edit icon
- [ ] Should open edit form with current data pre-filled

**2.3 Change Product Data**
- [ ] Change name: `TEST_PRODUCT_001` → `TEST_PRODUCT_001_EDITED`
- [ ] Change price: `123456` → `654321`
- [ ] Click "Cập nhật sản phẩm" or "Lưu"

**2.4 Check F12 Network**
- [ ] Find PUT request to `/api/products/:id`
- [ ] **Status should be 200** ✓

**2.5 Verify Changes in Admin**
- [ ] Go to Admin page
- [ ] Should see updated name and price
- [ ] ✅ `TEST_PRODUCT_001_EDITED` with 654,321đ price

**2.6 Reload and Verify**
- [ ] Reload (F5) Admin page
- [ ] ✅ Changes persist (not reverted)

**2.7 Check Other Pages**
- [ ] Go to Index
- [ ] ✅ Should see updated product info

**✅ TEST 2 PASSED if all changes persist**

---

## ✅ TEST 3: Delete Product - Removal Check

**Duration:** 5 minutes  
**Goal:** Verify deleted product doesn't reappear

### Steps:

**3.1 Find Product to Delete**
- [ ] Admin page
- [ ] Find `TEST_PRODUCT_001_EDITED` in product list
- [ ] Click delete button (trash icon)

**3.2 Confirm Delete**
- [ ] Alert/dialog appears
- [ ] Confirm deletion

**3.3 Check F12 Network**
- [ ] Find DELETE request to `/api/products/:id`
- [ ] **Status should be 200** ✓

**3.4 Verify Disappears from Admin**
- [ ] Product disappears from table immediately ✓

**3.5 Reload Admin - Persistence of Deletion**
- [ ] Press F5 (reload)
- [ ] ✅ Product should NOT reappear (truly deleted)

**3.6 Check Index Page**
- [ ] Go to Index
- [ ] ✅ `TEST_PRODUCT_001_EDITED` should NOT appear

**3.7 Incognito Tab - Database Confirmation**
- [ ] Open new Incognito tab
- [ ] Navigate to Index
- [ ] ✅ Product still gone (confirmed deleted from MongoDB)

**✅ TEST 3 PASSED if product stays deleted**

---

## 🔴 FAILURE SCENARIOS & FIXES

### ❌ Scenario 1: Product Appears Then Disappears After 1-2 Seconds

**Symptom:**
- Add product → Admin table shows it
- Go to Index → See product
- Wait 2 seconds → Product vanishes ✗

**Diagnosis:**
- sessionStorage cache wasn't cleared
- OR syncProductsFromServer() is using old data

**Debug:**
```javascript
// Check 1: Was cache cleared?
console.log('sessionStorage cache:', 
  sessionStorage.getItem('homepageProductsCache'));
// Should be null

// Check 2: What's in window cache?
console.log('window.__productsCache length:', 
  window.__productsCache?.length);
// Should match API count

// Check 3: Sync status
console.log('Sync status:', window.__productsSyncStatus);
// Should be 'success'
```

**Fix:**
- [ ] Verify `clearAllProductsCache()` is being called in `saveProductFromForm()`
- [ ] Check that `sessionStorage.removeItem('homepageProductsCache')` is in the function
- [ ] If not found, add manually and reload

---

### ❌ Scenario 2: POST Returns 201 But Product Doesn't Appear Anywhere

**Symptom:**
- F12 Network: POST /api/products = 201 ✓
- Admin table: Empty / Product doesn't show
- Index: Product doesn't appear

**Diagnosis:**
- POST succeeded but syncProductsFromServer() failed
- OR renderProductTable() not called

**Debug:**
```javascript
// Check if API actually has the product
fetch('http://localhost:5000/api/products')
  .then(r => r.json())
  .then(data => {
    const found = data.find(p => p.name === 'TEST_PRODUCT_001');
    console.log('Product in API:', found ? 'YES' : 'NO');
    console.log('Total products:', data.length);
  });
```

**Fix:**
- [ ] Verify MongoDB is running and connected
- [ ] Check backend logs for errors
- [ ] Manually run GET /api/products in Postman

---

### ❌ Scenario 3: POST Returns Error (401, 403, 500)

**Symptom:**
- F12 Network: POST /api/products = 401/403/500
- Alert: "Không thể lưu sản phẩm lên server"

**Diagnosis:**
- Authentication issue OR server error

**Fix:**
- [ ] If 401/403: Logout → login again as admin
- [ ] If 500: Check backend console for error
- [ ] Verify MongoDB connection

---

## 🧹 Cleanup After Tests

**Delete test products from MongoDB:**
```bash
# Using MongoDB shell (if you have it installed):
db.products.deleteMany({name: {$regex: "TEST_PRODUCT"}})
```

Or manually:
- [ ] Open Admin
- [ ] Delete all products starting with "TEST_PRODUCT_"

---

## 📋 Final Checklist

```
[ ] Test 1: Add Product Persists ✅
  [ ] POST = 201
  [ ] Admin shows product
  [ ] Index shows product immediately  
  [ ] Waits 2s: still visible
  [ ] Reload: persists
  [ ] Incognito: visible

[ ] Test 2: Edit Product Persists ✅
  [ ] PUT = 200
  [ ] Changes appear in admin
  [ ] Changes survive reload
  [ ] Changes appear in index

[ ] Test 3: Delete Product Removed ✅
  [ ] DELETE = 200
  [ ] Disappears from admin
  [ ] Disappears from index
  [ ] Doesn't reappear on reload
  [ ] Incognito confirms deleted

[ ] No Test Data Left
  [ ] All TEST_PRODUCT_* deleted
  [ ] Database clean
```

---

**When all 3 tests pass: ✅ BUG FIXED!**

If any test fails, share:
1. Which test failed
2. Screenshot of F12 Network (show request/response)
3. Console errors (if any)
4. MongoDB product count before/after
