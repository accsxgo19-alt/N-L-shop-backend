const assert = require('assert');
const orderController = require('../controllers/orderController');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

(async () => {
  const originalOrderCreate = Order.create;
  const originalCartFindOne = Cart.findOne;
  const originalProductFind = Product.find;

  try {
    Order.create = async (doc) => ({ ...doc, _id: 'order-1' });
    Cart.findOne = async () => null;
    Product.find = function find(query) {
      const products = [
        {
          _id: 'product-1',
          id: '001',
          name: 'Áo Thun Basic',
          price: 150000,
          stock: 10,
          sold: 0,
          $locals: {},
          save: async function save() {
            return this;
          },
        },
      ];

      const result = query && query.$or ? products : [];
      return {
        then: (resolve) => resolve(result),
        sort: () => ({ then: (resolve) => resolve([]) }),
      };
    };

    const req = {
      user: { _id: 'user-1', email: 'guest@example.com' },
      body: {
        fullname: 'Nguyễn Văn A',
        phone: '0900000000',
        address: '123 đường ABC, Quận 1',
        email: 'guest@example.com',
        paymentMethod: 'cash',
        items: [{ productId: '001', quantity: 1 }],
      },
      app: { locals: {} },
    };

    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    await orderController.createOrder(req, res);

    assert.strictEqual(res.statusCode, 201, 'guest checkout should create an order');
    assert.strictEqual(res.body.order.customerEmail, 'guest@example.com');
    console.log('guest checkout regression test passed');
  } finally {
    Order.create = originalOrderCreate;
    Cart.findOne = originalCartFindOne;
    Product.find = originalProductFind;
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
