# RESUMO DE MUDANÇAS - CRUD Sản Phẩm MongoDB Sync

## 🎯 Problema Original
1. Editar sản phẩm (tên, giá, ảnh) não atualiza em outras páginas/após reload
2. Xóa sản phẩm, reload → sản phẩm reaparece (não foi deletado realmente)

## ✅ Soluções Implementadas

### Backend (`backend/controllers/productController.js`)
```
updateProduct():
  - Tenta buscar por mongoose.Types.ObjectId.isValid(_id)
  - Se não achar, busca por field id (001, 002, etc)
  - Valida e ép type de price, stock, rating, sold para Number
  - Aplica defaults se vazio (stock:10, rating:0, sold:0)
  - Salva com product.save()

deleteProduct():
  - Tenta buscar por _id (MongoDB style)
  - Fallback para field id
  - Usa Product.deleteOne({ _id: product._id })
  - Logs: "Delete product request for id: X" + "Deleted product result: {deletedCount: 1}"
  - Retorna JSON com message
```

### Frontend - main.js
```
resolveProductMongoId(productId):
  - Se productId já é valid _id (24 hex chars), retorna direto
  - Senão busca no server via findServerProductByIdentifier()
  - Retorna MongoDB _id para PUT/DELETE

deleteProductFromServer(productId):
  - Valida admin + token
  - Resolve para _id real
  - DELETE /api/products/<_id> com Authorization header
  - Clear caches: window.__productsCache = null
  - await syncProductsFromServer()
  - return true/false

saveProductEdit(productId):
  - Resolve para _id real
  - Detecta POST vs PUT (se !actualProductId → POST)
  - Lê FileInput → Base64 DataURL se houver arquivo
  - PUT /api/products/<_id> ou POST /api/products
  - Clear caches + await syncProductsFromServer()
  - Redirect para admin.html ou index.html

syncProductsFromServer():
  - Fetch GET /api/products
  - Set window.__productsCache = response data
  - Set window.__productsSyncStatus = 'success'
  - Dispatch event 'products:updated'
  - NUNCA usa localStorage fallback se sync OK
  
getAllProducts():
  - Check window.__productsCache primeiro
  - Se sync pending/failed → usa getStoredProducts() (localStorage fallback)
  - Return dados sempre
  
loadProducts():
  - AWAIT syncProductsFromServer() se status !== 'success'
  - Depois renderiza com dados atualizado
```

### Frontend - admin.html
```
saveProductFromForm():
  - Lê file input → Base64 se houver arquivo
  - POST para criar novo, PUT para editar existente
  - Resolve _id via resolveProductMongoId() se editMode
  - Clear window.__productsCache + localStorage
  - await syncProductsFromServer()
  - Chama renderProductTable() + loadAdminDashboard()

deleteProduct(productId):
  - Chama await deleteProductFromServer(productId)
  - Se sucesso: renderProductTable() + loadAdminDashboard()
```

## 📋 Arquivos Modificados

```
✓ backend/controllers/productController.js
  - updateProduct: coerção de tipo + defaults
  - deleteProduct: logging + Product.deleteOne(_id)

✓ backend/routes/products.js
  - Já estava correto (POST/PUT/DELETE com auth+admin)

✓ backend/nl1/main.js
  - resolveProductMongoId: resolve _id real
  - deleteProductFromServer: DELETE + cache clear + sync
  - saveProductEdit: PUT/POST + cache clear + sync
  - syncProductsFromServer: nunca fallback localStorage
  - loadProducts: AWAIT syncProductsFromServer()

✓ backend/nl1/admin.html
  - Adicionado input#productStock
  - saveProductFromForm: cache clear + sync
  - deleteProduct: usa deleteProductFromServer

✓ backend/nl1/product.html
  - Sem mudanças (já usa loadProductDetail + saveProductEdit)
```

## 🧪 Procedimento de Teste

### Teste Rápido Manual (F12 Network)

**TESTE A: Editar Sản phẩm Existente**
1. Admin → Sửa `Áo Thun Basic` (id:001)
2. Change tên → `Áo Premium`
3. Change giá → `200000`
4. Lưu
5. ✓ Network: `PUT /api/products/xxx` status 200
6. ✓ Admin table atualiza IMEDIATAMENTE (sem reload)
7. ✓ Reload index.html → novo nome/preço aparecem
8. ✓ Abrir tab anônima → dados novos (MongoDB confirmed)

**TESTE B: Xóa Sản phẩm**
1. Admin → Thêm sản phẩm `DELETE_TEST_123`
2. Click Xóa
3. ✓ Network: `DELETE /api/products/xxx` status 200
4. ✓ Admin table sản phẩm desaparece
5. ✓ Reload admin → NÃO reaparece
6. ✓ Reload index.html → não aparece
7. ✓ Tab anônima → definitivamente não está

**TESTE C: Upload Ảnh (Base64)**
1. Product edit form → Choose file
2. Preview atualiza com ảnh local
3. Lưu
4. ✓ Network PUT body: `"image":"data:image/png;base64,iVBORw0K..."`
5. ✓ Reload → ảnh nova persiste

**TESTE D: Múltiplas Abas**
1. Admin aba 1: Edita mesmo produto trocando nome `V2`
2. Admin aba 2: Edita MESMO produto trocando nome `V3`
3. Aba 1 Lưu → redirect admin aba 1 mostra `V2`
4. Aba 2 Lưu → redirect admin aba 2 mostra `V3` (last write wins)
5. Reload ambas → MongoDB tem `V3` (final winner)

### Teste via CURL (Sem Frontend)

```powershell
# 1. Pega token admin (via login endpoint)
$token = "eyJhbGc..."

# 2. POST - Criar
curl -X POST http://localhost:5000/api/products `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"name":"Test","price":100000,"category":"Áo","description":"Test","stock":10,"rating":4,"sold":0}'

# 3. PUT - Editar (use _id từ response POST)
curl -X PUT http://localhost:5000/api/products/<_id> `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"name":"Test Updated","price":150000,"stock":5}'

# 4. DELETE - Xóa
curl -X DELETE http://localhost:5000/api/products/<_id> `
  -H "Authorization: Bearer $token"

# 5. Verify - GET all
curl http://localhost:5000/api/products
```

Arquivo executável: `TESTE_CRUD_API.bat` (Windows)

## 🔴 Troubleshooting

### Problema: Sản phẩm đã sửa nhưng không cập nhật trang chủ/admin

**Checklist:**
- [ ] F12 Network → PUT trả status 200?
  - Se 404: URL có _id sai, hoặc backend không tìm thấy
  - Se 401/403: token hết hạn, logout + login lại
  - Se 500: backend error, check console server
- [ ] Console browser: `syncProductsFromServer()` called?
  - Gõ `window.__productsSyncStatus` → should be 'success'
- [ ] localStorage limpo?
  - Gõ `localStorage.getItem('products')` → should be null
- [ ] Cache zerado?
  - Gõ `window.__productsCache` → should be fresh array (gọi GET /api/products)

**Fix:**
```javascript
// Forçar re-sync no console
syncProductsFromServer().then(() => {
  location.reload();
});
```

### Problema: Xóa sản phẩm, reload vẫn hiển thị

**Checklist:**
- [ ] F12 Network → DELETE trả status 200?
- [ ] Logs server: "Deleted product result: {deletedCount: 1}"?
  - Se deletedCount=0: MongoDB không encontrou documento
- [ ] localStorage limpo? Gõ `localStorage.getItem('products')`
- [ ] Tab anônima não tem sản phẩm? (confirma não é cache browser)

**Fix:**
```javascript
// Limpar tudo e re-sync
localStorage.clear();
window.__productsCache = null;
window.__productsSyncStatus = 'pending';
location.reload();
```

### Problema: 401/403 ao tentar DELETE/PUT

- [ ] Token admin válido? `getCurrentUserToken()` no console
- [ ] Token expirado? Logout + Login novamente
- [ ] User é admin? Check `isAdmin()` em console
- [ ] Authorization header enviado? F12 Network → Preview → Headers section

### Problema: Base64 ảnh não salva

- [ ] Arquivo escolhido? F12 → console → `document.getElementById('productImageFile').files`
- [ ] FileReader funcionando? Gõ `readFileInputToDataURL(document.getElementById('productImageFile'))`
- [ ] Body request tem image field? Network → PUT Request body
- [ ] Size > 10MB? Servidor rejeita (413 Payload Too Large)

## 📞 Informações para Debug

Quando relatar erro, forneça:

1. **Network Request Details:**
   - URL: `PUT /api/products/...`
   - Method: PUT
   - Status: 200? 404? 500?
   - Request Headers: Authorization presente?
   - Request Body: name/price/stock enviados?
   - Response Body: error message?

2. **Console Logs (DevTools):**
   - Copiar `Não thể lưu sản phẩm lên server` erro
   - Copiar output de `console.error(...)`

3. **Server Logs:**
   - Terminal onde `npm start` roda
   - Procura: "Delete product", "Update product", error stacktrace

4. **Dados do Produto:**
   - ID sendo editado/deletado (001? MongoDB _id?)
   - Antes/depois valores

Formato ideal:
```
[REQUEST]
PUT /api/products/507f1f77bcf86cd799439011
Status: 404
Response: {"message":"Sản phẩm không tìm thấy."}

[EXPECTATION]
Should find product with _id=507f1f77bcf86cd799439011

[ACTUAL]
Not found

[GUESS]
Maybe need to resolve id=001 to real _id first?
```

## ✨ Resumo Final

✅ Backend agora:
- Suporta _id MongoDB + custom field id
- Deleta realmente (não reaparece)
- Loga operações para debug

✅ Frontend agora:
- Resolve _id antes de PUT/DELETE
- Limpa cache antes de re-fetch
- Nunca usa localStorage stale
- Aguarda syncProductsFromServer() antes render

✅ Fluxo completo:
1. User edita/deleta → API call com _id certo
2. API modifica MongoDB
3. Frontend limpa cache + re-sync GET /api/products
4. Dados updated em todas as páginas
5. Reload/tab anônima: sempre MongoDB (source of truth)

---

**Próxima ação:** Execute `TESTE_CRUD_API.bat` ou testes manual em F12, compartilhe o erro se houver.
