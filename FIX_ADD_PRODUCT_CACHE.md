# 🔧 FIX: Product Add Not Persisting After Reload

## Problem ❌

**User reports:**
- Thêm sản phẩm mới ở Admin
- Quay lại trang chủ → sản phẩm xuất hiện ✓
- Chờ 1-2 giây hoặc reload → sản phẩm biến mất ✗
- MongoDB kiểm tra → sản phẩm đã lưu ✓

**Root Cause:**
- `sessionStorage.homepageProductsCache` không được clear khi admin save product
- Khi quay lại index.html, initializeIndexProducts() dùng cache cũ (< 30 giây)
- Sau khi syncProductsFromServer() lấy data mới từ API → sản phẩm bị ghi đè

---

## Solution ✅

### 1. **New Function: `clearAllProductsCache()`** [main.js]
```javascript
// Clear ALL product caches (window, localStorage, sessionStorage)
function clearAllProductsCache() {
    window.__productsCache = null;
    window.__productsSyncStatus = 'pending';
    localStorage.removeItem('products');
    localStorage.removeItem('shopProducts');
    localStorage.removeItem('cachedProducts');
    sessionStorage.removeItem('homepageProductsCache');  // ← KEY FIX!
}
```

**Location:** main.js, line ~1413 (before `syncProductsFromServer()`)

### 2. **Updated: `saveProductFromForm()`** [admin.html]
```javascript
// OLD: 
window.__productsCache = null;
window.__productsSyncStatus = 'pending';
localStorage.removeItem('products');
localStorage.removeItem('shopProducts');
localStorage.removeItem('cachedProducts');
await syncProductsFromServer();

// NEW:
clearAllProductsCache();  // ← Single call handles all caches
await syncProductsFromServer();
```

**Location:** admin.html, line ~545

### 3. **Updated: `saveProductEdit()`** [main.js]
```javascript
// OLD:
window.__productsCache = null;
window.__productsSyncStatus = 'pending';
localStorage.removeItem(STORAGE_PRODUCTS_KEY);
localStorage.removeItem('shopProducts');
localStorage.removeItem('cachedProducts');

// NEW:
clearAllProductsCache();  // ← Single call
```

**Location:** main.js, line ~2048

### 4. **Updated: `deleteProductFromServer()`** [main.js]
```javascript
// OLD:
window.__productsCache = null;
window.__productsSyncStatus = 'pending';
localStorage.removeItem(STORAGE_PRODUCTS_KEY);
localStorage.removeItem('shopProducts');
localStorage.removeItem('cachedProducts');

// NEW:
clearAllProductsCache();  // ← Single call
```

**Location:** main.js, line ~1920

---

## Cache Strategy Now

### Before Add/Edit/Delete:
```javascript
clearAllProductsCache();  // Clear 5 cache sources:
                          // 1. window.__productsCache
                          // 2. window.__productsSyncStatus
                          // 3. localStorage: 'products'
                          // 4. localStorage: 'shopProducts'
                          // 5. localStorage: 'cachedProducts'
                          // 6. sessionStorage: 'homepageProductsCache'  ← NEW!
```

### After POST/PUT/DELETE response (success):
```javascript
await syncProductsFromServer();  // Fetch fresh data from API
                                 // Set window.__productsCache = newest
                                 // Set sessionStorage: 'homepageProductsCache'
                                 // Dispatch 'products:updated' event
```

### When User Navigates to index.html:
```javascript
initializeIndexProducts() → getHomepageProductsCache()
  // Now returns NULL (cleared after mutations)
  → syncProductsFromServer() called
  → Fetch GET /api/products from MongoDB
  // Now INCLUDES newly added products
  → loadProducts() renders fresh data ✅
```

---

## Data Flow Diagram

### ❌ BEFORE (Buggy):
```
User: Add product "New Item" at Admin
  ↓
POST /api/products → 201 (MongoDB saved)
  ↓
saveProductFromForm():
  - localStorage cleared ✓
  - sessionStorage NOT cleared ✗
  - syncProductsFromServer() called
  ↓
renderProductTable() shows "New Item" ✓
  ↓
User navigates to index.html
  ↓
initializeIndexProducts():
  - getHomepageProductsCache() → OLD cache exists (< 30s)  ✗
  - window.__productsCache = old data (without "New Item")
  - loadProducts() renders old data
  ↓
syncProductsFromServer() (in background):
  - Fetches GET /api/products (NOW has "New Item")
  - Updates window.__productsCache = new data
  ↓
'products:updated' event → loadProducts() re-renders
  - But old UI already rendered!
  - Race condition: sometimes shows, sometimes disappears
  ✗ INCONSISTENT
```

### ✅ AFTER (Fixed):
```
User: Add product "New Item" at Admin
  ↓
POST /api/products → 201 (MongoDB saved)
  ↓
saveProductFromForm():
  - clearAllProductsCache() removes ALL cache including sessionStorage ✓
  - syncProductsFromServer() called
  ↓
renderProductTable() shows "New Item" ✓
  ↓
User navigates to index.html
  ↓
initializeIndexProducts():
  - getHomepageProductsCache() → NULL (just cleared!)  ✓
  - isCacheFresh = false
  - Skips using old cache
  ↓
syncProductsFromServer() (async in background):
  - Fetches GET /api/products (includes "New Item")
  - Updates window.__productsCache = fresh data
  ↓
'products:updated' event → loadProducts() re-renders with fresh data
  ✓ CORRECT: "New Item" persists!
```

---

## Files Modified

| File | Changes | Lines |
|------|---------|-------|
| main.js | Add `clearAllProductsCache()` function | ~1413 |
| main.js | Use `clearAllProductsCache()` in `saveProductEdit()` | ~2048 |
| main.js | Use `clearAllProductsCache()` in `deleteProductFromServer()` | ~1920 |
| admin.html | Use `clearAllProductsCache()` in `saveProductFromForm()` | ~545 |

---

## Test Steps (Do This!)

### Test 1: Add Product Persists
```
1. Open F12 → Network tab
2. Admin page: Add product "TEST_NEW_ITEM"
   - Price: 999000
   - Category: Áo
   - Description: Test product
3. Check F12 Network:
   - POST /api/products = 201 ✓
4. Admin table: See "TEST_NEW_ITEM" ✓
5. Open index.html
6. See "TEST_NEW_ITEM" immediately ✓
7. Wait 2 seconds: Still see it ✓
8. Reload F5: Still there ✓
9. Open tab ẩn danh: See it ✓
   → Product saved to MongoDB ✓
```

### Test 2: Edit Product Persists
```
1. Admin: Edit existing product (change name)
2. Check F12: PUT /api/products/... = 200 ✓
3. Admin table updates ✓
4. Go to index.html: See new name ✓
5. Reload: Still new name ✓
```

### Test 3: Delete Still Works
```
1. Admin: Delete a product
2. Check F12: DELETE /api/products/... = 200 ✓
3. Admin table: Product gone ✓
4. Go to index.html: Product gone ✓
5. Reload: Product gone ✓
6. Tab ẩn danh: Product gone ✓
```

---

## What Changed

| Aspect | Before | After |
|--------|--------|-------|
| Cache sources cleared | 4 | 6 (+ sessionStorage) |
| Lines of code per mutation | 4 lines | 1 line (`clearAllProductsCache()`) |
| Risk of missing a cache | High | Low |
| Consistency | Inconsistent (race condition) | Consistent |

---

## Debugging

If product STILL disappears after reload:

1. **Check sessionStorage was cleared**
   ```javascript
   sessionStorage.getItem('homepageProductsCache')  // Should be null
   ```

2. **Check syncProductsFromServer() was called**
   ```javascript
   console.log(window.__productsCache.length);  // Should be current count
   ```

3. **Check POST succeeded**
   - F12 Network: POST = 201 status ✓
   - MongoDB: Product exists ✓

4. **Check cache ttl**
   ```javascript
   const cache = getHomepageProductsCache();
   console.log(Date.now() - cache.timestamp);  // Should be < 30000
   ```

---

## Notes

- No API changes needed
- No database schema changes
- Purely frontend cache management fix
- Safe to deploy
- No breaking changes

---

**Status:** 🟢 READY TO TEST  
**Risk:** Low (cache clearing only)  
**Impact:** Fixes "product disappears after reload" bug
