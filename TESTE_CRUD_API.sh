#!/bin/bash

# ============================================
# TESTE CURL - CRUD API Produtos
# ============================================
# Execute: bash TESTE_CRUD_API.sh

API_URL="http://localhost:5000/api/products"
ADMIN_TOKEN="SEU_TOKEN_ADMIN_AQUI"  # Obtenha token ao fazer login admin

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TESTE CRUD API PRODUTOS ===${NC}\n"

# ============================================
# TESTE 1: GET - Listar Todos os Produtos
# ============================================
echo -e "${BLUE}[TEST 1] GET /api/products${NC}"
echo "Comando:"
echo "curl -X GET $API_URL"
echo ""

response=$(curl -s -X GET "$API_URL")
echo "Response:"
echo "$response" | head -c 200
echo -e "\n\n"

# ============================================
# TESTE 2: POST - Criar Novo Produto
# ============================================
echo -e "${BLUE}[TEST 2] POST /api/products (Criar novo)${NC}"
echo "Comando:"
echo 'curl -X POST $API_URL \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Authorization: Bearer $ADMIN_TOKEN" \'
echo '  -d "..."'
echo ""

# Produto de teste
test_product=$(cat <<EOF
{
  "id": "TEST_$(date +%s)",
  "name": "Produto Teste Curl",
  "category": "Áo",
  "price": 299999,
  "description": "Teste via CURL - será deletado",
  "image": "🧪",
  "stock": 5,
  "rating": 4.0,
  "sold": 0
}
EOF
)

response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "$test_product")

echo "Response:"
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""

# Extrair MongoDB _id do response (para testes subsequentes)
MONGO_ID=$(echo "$response" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$MONGO_ID" ]; then
  MONGO_ID=$(echo "$response" | grep -o '"_id": "[^"]*"' | cut -d'"' -f4)
fi

if [ ! -z "$MONGO_ID" ]; then
  echo -e "${GREEN}MongoDB _id extraído: $MONGO_ID${NC}\n"
else
  echo -e "${RED}AVISO: Não foi possível extrair _id${NC}\n"
fi

# ============================================
# TESTE 3: GET - Buscar Produto por ID
# ============================================
echo -e "${BLUE}[TEST 3] GET /api/products/:id${NC}"
if [ ! -z "$MONGO_ID" ]; then
  echo "Buscando com _id: $MONGO_ID"
  curl -s -X GET "$API_URL/$MONGO_ID" | python3 -m json.tool 2>/dev/null || curl -s -X GET "$API_URL/$MONGO_ID"
else
  echo "Usando id customizado: 001"
  curl -s -X GET "$API_URL/001" | python3 -m json.tool 2>/dev/null || curl -s -X GET "$API_URL/001"
fi
echo -e "\n"

# ============================================
# TESTE 4: PUT - Atualizar Produto
# ============================================
echo -e "${BLUE}[TEST 4] PUT /api/products/:id (Atualizar)${NC}"

if [ ! -z "$MONGO_ID" ]; then
  echo "Atualizando produto com _id: $MONGO_ID"
  
  update_payload=$(cat <<EOF
{
  "name": "Produto Teste Curl - ATUALIZADO",
  "category": "Quần",
  "price": 399999,
  "description": "Atualizado via CURL",
  "stock": 8,
  "rating": 4.5,
  "sold": 2
}
EOF
)

  curl -s -X PUT "$API_URL/$MONGO_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "$update_payload" | python3 -m json.tool 2>/dev/null || \
    curl -s -X PUT "$API_URL/$MONGO_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d "$update_payload"
else
  echo "Pulando PUT (sem _id válido do POST anterior)"
fi
echo -e "\n"

# ============================================
# TESTE 5: DELETE - Deletar Produto
# ============================================
echo -e "${BLUE}[TEST 5] DELETE /api/products/:id (Deletar)${NC}"

if [ ! -z "$MONGO_ID" ]; then
  echo "Deletando produto com _id: $MONGO_ID"
  
  curl -s -X DELETE "$API_URL/$MONGO_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool 2>/dev/null || \
    curl -s -X DELETE "$API_URL/$MONGO_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN"
  echo ""
  
  # Verificar se foi deletado
  echo -e "${BLUE}Verificando se produto foi deletado...${NC}"
  response=$(curl -s -X GET "$API_URL/$MONGO_ID")
  if echo "$response" | grep -q "não tìm thấy\|not found"; then
    echo -e "${GREEN}✓ Produto deletado com sucesso${NC}"
  else
    echo -e "${RED}✗ Erro: Produto ainda existe${NC}"
    echo "$response"
  fi
else
  echo "Pulando DELETE (sem _id válido do POST anterior)"
fi
echo -e "\n"

echo -e "${GREEN}=== TESTES CONCLUÍDOS ===${NC}"
echo "Próximos passos:"
echo "1. Verifique F12 Network se os requests estão funcionando"
echo "2. Se DELETE falhar, verifique:"
echo "   - Token admin válido"
echo "   - MongoDB rodando"
echo "   - Permissões de acesso"
