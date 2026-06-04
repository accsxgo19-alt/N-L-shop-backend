@echo off
REM ============================================
REM TESTE CRUD API - Windows PowerShell Version
REM ============================================

setlocal enabledelayedexpansion

set API_URL=http://localhost:5000/api/products
set ADMIN_TOKEN=SEU_TOKEN_ADMIN_AQUI
set MONGO_ID=

echo.
echo ============================================
echo === TESTE CRUD API PRODUTOS (WINDOWS) ===
echo ============================================
echo.

REM ============================================
REM TESTE 1: GET - Listar Todos Produtos
REM ============================================
echo [TEST 1] GET /api/products
echo.
curl -X GET "%API_URL%"
echo.
echo.

REM ============================================
REM TESTE 2: POST - Criar Novo Produto
REM ============================================
echo [TEST 2] POST /api/products (Criar novo)
echo.

set "test_product={\"id\":\"TEST_CURL_001\",\"name\":\"Produto Teste Windows\",\"category\":\"Áo\",\"price\":299999,\"description\":\"Teste via CURL - será deletado\",\"image\":\"🧪\",\"stock\":5,\"rating\":4.0,\"sold\":0}"

echo Enviando:
echo %test_product%
echo.
echo Response:

for /f "tokens=*" %%A in ('curl -s -X POST "%API_URL%" -H "Content-Type: application/json" -H "Authorization: Bearer %ADMIN_TOKEN%" -d "%test_product%"') do (
    set "response=%%A"
    echo !response!
)

echo.
echo.

REM ============================================
REM TESTE 3: GET - Buscar Produto
REM ============================================
echo [TEST 3] GET /api/products/001
echo.
curl -X GET "%API_URL%/001"
echo.
echo.

REM ============================================
REM TESTE 4: PUT - Atualizar Produto
REM ============================================
echo [TEST 4] PUT /api/products/001 (Atualizar)
echo.

set "update_payload={\"name\":\"Áo Thun Premium v2\",\"category\":\"Áo\",\"price\":200000,\"description\":\"Teste UPDATE via CURL\",\"stock\":15,\"rating\":4.5,\"sold\":1}"

echo Enviando update:
echo %update_payload%
echo.
echo Response:

curl -s -X PUT "%API_URL%/001" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -d "%update_payload%"

echo.
echo.

REM ============================================
REM TESTE 5: DELETE - Deletar Produto
REM ============================================
echo [TEST 5] DELETE /api/products/001 (Deletar)
echo.

curl -s -X DELETE "%API_URL%/001" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%"

echo.
echo.

REM ============================================
REM TESTE 6: Verificar se foi deletado
REM ============================================
echo [TEST 6] GET /api/products/001 (Verificar se deletado)
echo Se retornar 404 ou "nao tim thay": SUCESSO
echo.
curl -X GET "%API_URL%/001"
echo.
echo.

echo ============================================
echo === TESTES CONCLUÍDOS ===
echo ============================================
echo.
echo INSTRUÇÕES:
echo 1. Abra PowerShell neste diretório
echo 2. Execute: .\TESTE_CRUD_API.bat
echo 3. Verifique responses no console
echo 4. Se tiver erros, copie o erro completo
echo.
pause
