const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('checkout page allows guest checkout instead of forcing login', () => {
  const checkoutPath = path.join(__dirname, '..', 'nl1', 'checkout.html');
  const html = fs.readFileSync(checkoutPath, 'utf8');

  assert.ok(!html.includes("alert('Vui lòng đăng nhập để thanh toán.'),"), 'checkout should not block guest users with an alert');
  assert.ok(!html.includes("window.location.href = 'login.html'"), 'checkout should not redirect unauthenticated users to login');
});
