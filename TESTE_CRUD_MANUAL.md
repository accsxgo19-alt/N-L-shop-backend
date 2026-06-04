# Teste Manual CRUD Produtos - MongoDB Sync

## Setup Pré-requisitos
1. Servidor backend rodando em `http://localhost:5000`
2. Frontend em `http://localhost:5000` (ou arquivo local)
3. MongoDB conectado e funcionando
4. Usuário admin logado com token JWT válido

---

## Teste 1: POST - Criar Sản phẩm Novo

### Passo 1.1: Via Admin UI
1. Abra DevTools (F12) → Network
2. Vá para `admin.html`
3. Preencha form:
   - Tên: `Test Product 123`
   - Danh mục: `Áo`
   - Giá: `500000`
   - Ảnh: `🎁` (emoji)
   - Mô tả: `Sản phẩm kiểm tra`
   - Stock: `10`
   - Đánh giá: `4.5`
   - Đã bán: `0`
4. Clique "Lưu thay đổi sản phẩm"

### Passo 1.2: Verifique Network
- Procure por `POST /api/products`
- Status deve ser `201` ou `200`
- Response deve conter `product._id` (MongoDB ID 24 chars)
- Response deve conter `product.id` (pode ser custom ou igual _id)

### Passo 1.3: Verifique Persistência
- Reload `index.html` → procure `Test Product 123` na lista
- Se não aparecer → erro de cache/sync
- Mude para abagua anônima → produto deve estar lá

---

## Teste 2: PUT - Editar Produto Existente

### Passo 2.1: Editar via Admin
1. Na tabela de admin, localize `Áo Thun Basic` (ID: `001`)
2. Clique botão "Sửa"
3. Mude:
   - Tên: `Áo Thun Premium v2`
   - Preço: `180000` → `200000`
4. Clique "Lưu thay đổi sản phẩm"

### Passo 2.2: Verifique Network
- Procure por `PUT /api/products/...`
- URL deve conter MongoDB `_id` (não `001`)
  - Se URL tiver `PUT /api/products/001` → erro (será 404)
- Status deve ser `200`
- Body enviado deve ter: `name`, `price`, `category`, `description`, `stock`, `rating`, `sold`

### Passo 2.3: Verifique Sincronização
- Não recarregue a página manualmente
- Admin tabela deve atualizar com novo nome `Áo Thun Premium v2`
- Reload `index.html` → nome e preço devem ser `200000`
- Abra `product.html?id=001` → deve mostrar preço novo

---

## Teste 3: DELETE - Xóa Sản phẩm

### Passo 3.1: Criar produto temporário
1. Crie um produto teste: `DELETE_TEST_001`
2. Anote seu MongoDB `_id` (veja na resposta POST)

### Passo 3.2: Deletar via Admin
1. Localize `DELETE_TEST_001` na tabela
2. Clique botão "Xóa"
3. Confirmar se houver alert

### Passo 3.3: Verifique Network
- Procure por `DELETE /api/products/...`
- URL deve conter MongoDB `_id`
- Status deve ser `200`
- Header `Authorization: Bearer <token>` deve estar presente

### Passo 3.4: Verifique Persistência
- Admin tabela não deve mais mostrar `DELETE_TEST_001`
- Reload `admin.html` → produto NÃO deve reaparecer
- Reload `index.html` → produto NÃO deve reaparecer
- Abra aba anônima → produto DEFINITIVAMENTE não deve estar lá

---

## Teste 4: Editar Imagem (Base64)

### Passo 4.1: Upload via Product Edit
1. Vá para `product.html?id=001&edit=1`
2. Clique "Hoặc chọn ảnh từ máy"
3. Escolha arquivo local (PNG/JPG)
4. Verifique preview atualiza
5. Clique "Lưu thay đổi"

### Passo 4.2: Verifique Network
- Procure por `PUT /api/products/...`
- Body deve ter campo `image` começando com `data:image/...`
- Request size pode ser maior (imagem em Base64)

### Passo 4.3: Sincronização
- Reload todas as páginas
- Imagem nova deve aparecer

---

## Teste 5: Concorrência / Cache

### Passo 5.1: Múltiplas Abas
1. Abra 2 abas: `admin.html` em ambas
2. Aba 1: Edite produto (trocando tên para `V2`)
3. Aba 2: Edite MESMO produto (trocando tên para `V3`)
4. Salve Aba 1 primeiro, depois Aba 2

### Passo 5.2: Resultado
- Aba 1 redireciona para `admin.html`, tabela mostra `V2`
- Aba 2 idem (pode sobrescrever com `V3`)
- Reload ambas → último salvo ("V3" ou "V2") deve vencer
- MongoDB terá valor final correto

---

## Teste 6: Falhas Esperadas

### Falha 6.1: Token Expirado
1. Logout (`logout()` console)
2. Tente editar/deletar
- Deve redirecionar para login

### Falha 6.2: Não-Admin
1. Logout
2. Registre conta nova (role=customer)
3. Tente acessar `admin.html`
- Deve mostrar alert e redirecionar

### Falha 6.3: MongoDB _id Inválido
1. Crie produto com `id=001`
2. Edite diretamente URL para `product.html?id=INVALID_HASH&edit=1`
- Deve falhar com "Não tìm thấy sản phẩm"

---

## Checklist de Validação Final

- [ ] POST cria produto com MongoDB `_id`
- [ ] PUT atualiza usando `_id`, não `001`
- [ ] DELETE remove realmente de MongoDB (não reaparece em reload)
- [ ] Cache limpo após mutações
- [ ] syncProductsFromServer() chamado após cada mutação
- [ ] Images Base64 salvam corretamente
- [ ] Auth headers enviados (DELETE/PUT/POST)
- [ ] Sem erros 401/403 se token válido
- [ ] Múltiplas abas funcionam (último vence)
- [ ] Tab anônima mostra dados corretos (MongoDB source)

---

## Console Logs para Debug

Coloque no console do DevTools para rastrear:

```javascript
// Ver cache atual
console.log('Cache:', window.__productsCache);
console.log('Sync Status:', window.__productsSyncStatus);

// Ver localStorage
console.log('LocalStorage:', localStorage.getItem('products'));

// Forçar re-sync
syncProductsFromServer().then(data => console.log('Re-synced:', data));

// Ver produto específico
console.log('Produto 001:', getProductById('001'));
```

---

## Logs Esperados no Backend

Ao deletar, servidor deve logar:
```
Delete product request for id: 001
Deleted product result: { deletedCount: 1 }
```

Ao atualizar, servidor deve logar:
```
Update product: 001 → Áo Thun Premium v2
```

