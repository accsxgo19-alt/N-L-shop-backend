// ==================== PRODUCTS DATA ====================
const LOCAL_BACKEND_ORIGIN = 'http://localhost:5000';
const API_BASE = window.location.protocol === 'file:'
    ? LOCAL_BACKEND_ORIGIN
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? LOCAL_BACKEND_ORIGIN
        : window.location.origin;

const STORAGE_PRODUCTS_KEY = 'products';
const STORAGE_ACTIVITY_KEY = 'activityLogs';
const STORAGE_CHAT_KEY = 'adminChatMessages';
const STORAGE_CURRENT_USER_KEY = 'currentUser';
const STORAGE_CART_KEY = 'cart';
const STORAGE_ORDERS_KEY = 'orders';

window.__productsCache = null;
window.__productsSyncStatus = 'pending';

const GOOGLE_CLIENT_ID = '395352824030-8a7c29ru5rr3fs3heg7us836f4kb40a8.apps.googleusercontent.com';
const FB_APP_ID = '3291612877757407';
let googleTokenClient = null;
let socialAuthInitialized = false;
let googleLoginResolve = null;
let googleLoginReject = null;
let facebookLoginResolve = null;
let facebookLoginReject = null;

function getAuthHeaders() {
    const token = getCurrentUserToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function getCurrentUserToken() {
    const user = getCurrentUser();
    return user?.token || '';
}

function normalizeProducts(productList) {
    return productList.map(product => ({
        ...product,
        id: String(product.id || product._id || product._id || product.id || ''),
    }));
}

const products = [
    {
        id: '001',
        name: 'Áo Thun Basic',
        category: 'Áo',
        price: 150000,
        image: 'img/aothun.jpg',
        rating: 4.5,
        sold: 320,
        createdAt: '2024-05-20',
        description: 'Áo thun trắng basic chất lượng cao'
    },
    {
        id: '002',
        name: 'Áo Sơ Mi Nam',
        category: 'Áo',
        price: 280000,
        image: 'img/aosomi1.jpg',
        rating: 4.8,
        sold: 210,
        createdAt: '2024-04-15',
        description: 'Áo sơ mi nam kiểu dáng hiện đại'
    },
    {
        id: '003',
        name: 'Áo Len Nữ',
        category: 'Áo',
        price: 320000,
        image: 'img/aolen1.jpg',
        rating: 4.6,
        sold: 410,
        createdAt: '2024-06-10',
        description: 'Áo len nữ ấm áp mùa đông'
    },
    {
        id: '004',
        name: 'Quần Jeans Xanh',
        category: 'Quần',
        price: 350000,
        image: '👖',
        rating: 4.7,
        sold: 190,
        createdAt: '2024-03-08',
        description: 'Quần jeans xanh đen cơ bản'
    },
    {
        id: '005',
        name: 'Quần Tây Nam',
        category: 'Quần',
        price: 280000,
        image: '👔',
        rating: 4.5,
        sold: 270,
        createdAt: '2024-05-05',
        description: 'Quần tây nam chất liệu cao cấp'
    },
    {
        id: '006',
        name: 'Quần Legging Nữ',
        category: 'Quần',
        price: 200000,
        image: '🩳',
        rating: 4.9,
        sold: 450,
        createdAt: '2024-06-12',
        description: 'Quần legging co giãn thoải mái'
    },
    {
        id: '007',
        name: 'Váy Hoa Nữ',
        category: 'Váy',
        price: 380000,
        image: '👗',
        rating: 4.8,
        sold: 380,
        createdAt: '2024-06-07',
        description: 'Váy hoa vintage hè 2024'
    },
    {
        id: '008',
        name: 'Váy Xếp Li',
        category: 'Váy',
        price: 320000,
        image: '👗',
        rating: 4.6,
        sold: 265,
        createdAt: '2024-04-29',
        description: 'Váy xếp li trắng sang trọng'
    },
    {
        id: '009',
        name: 'Giày Sneaker Trắng',
        category: 'Giày',
        price: 450000,
        image: '👟',
        rating: 4.9,
        sold: 520,
        createdAt: '2024-05-28',
        description: 'Giày sneaker trắng thoáng khí'
    },
    {
        id: '010',
        name: 'Giày Cao Gót',
        category: 'Giày',
        price: 380000,
        image: '👠',
        rating: 4.7,
        sold: 330,
        createdAt: '2024-05-22',
        description: 'Giày cao gót đen thanh lịch'
    },
    {
        id: '011',
        name: 'Dép Nữ',
        category: 'Giày',
        price: 180000,
        image: '👡',
        rating: 4.5,
        sold: 145,
        createdAt: '2024-05-29',
        description: 'Dép nữ đi nhà thoải mái'
    },
    {
        id: '012',
        name: 'Túi Xách',
        category: 'Phụ kiện',
        price: 550000,
        image: '👜',
        rating: 4.8,
        sold: 295,
        createdAt: '2024-06-02',
        description: 'Túi xách nữ da thật'
    },
    {
        id: '013',
        name: 'Ví Da Nam',
        category: 'Phụ kiện',
        price: 320000,
        image: '🎒',
        rating: 4.6,
        sold: 220,
        createdAt: '2024-04-18',
        description: 'Ví da nam cao cấp'
    },
    {
        id: '014',
        name: 'Mũ Lưỡi Trai',
        category: 'Phụ kiện',
        price: 120000,
        image: '🧢',
        rating: 4.4,
        sold: 125,
        createdAt: '2024-06-14',
        description: 'Mũ lưỡi trai nam nữ'
    },
    {
        id: '015',
        name: 'Dây Chuyền Vàng',
        category: 'Phụ kiện',
        price: 280000,
        image: '⛓️',
        rating: 4.7,
        sold: 205,
        createdAt: '2024-05-12',
        description: 'Dây chuyền vàng tinh tế'
    }
];
function getStoredProducts() {
    const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (error) {
            return products;
        }
    }
    return products;
}

function saveProducts(productList) {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(productList));
}

function initializeProductData() {
    if (!localStorage.getItem(STORAGE_PRODUCTS_KEY)) {
        saveProducts(products);
    }
}
// ==================== LOCAL STORAGE FUNCTIONS ====================

// Users
function getAllUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function saveUser(user) {
    const users = getAllUsers();
    const existingUser = users.find(u => u.email === user.email);

    if (!existingUser) {
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    }
    return false;
}

function findUserByEmail(email) {
    const users = getAllUsers();
    return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
}

function findUserByPhone(phone) {
    const normalized = phone.replace(/\D/g, '');
    const users = getAllUsers();
    return users.find(u => u.phone && u.phone.replace(/\D/g, '') === normalized);
}

function isValidPhone(phone) {
    const normalized = phone.replace(/\D/g, '');
    return /^\d{9,15}$/.test(normalized);
}

function saveSocialLoginUser(user) {
    const existing = getAllUsers().find(u => u.email && u.email.toLowerCase() === user.email.toLowerCase());
    if (existing) {
        const updated = { ...existing, ...user };
        const users = getAllUsers();
        const index = users.findIndex(u => u.email && u.email.toLowerCase() === user.email.toLowerCase());
        if (index !== -1) {
            users[index] = updated;
            localStorage.setItem('users', JSON.stringify(users));
        }
        saveCurrentUser(updated);
        return updated;
    }
    saveUser(user);
    saveCurrentUser(user);
    return user;
}

function saveCurrentUser(user) {
    const users = getAllUsers();
    const index = users.findIndex(u => u.email === user.email);
    if (index !== -1) {
        users[index] = user;
    } else {
        users.push(user);
    }
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function getCurrentUserToken() {
    return getCurrentUser()?.token || '';
}

function getAuthHeaders() {
    const token = getCurrentUserToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Socket.IO client instance (set when logged in)
let socket = null;

function ensureSocketClientLoaded(callback) {
    if (window.io) return callback();
    const script = document.createElement('script');
    script.src = `${API_BASE}/socket.io/socket.io.js`;
    script.onload = () => callback();
    script.onerror = () => callback();
    document.head.appendChild(script);
}

function initSocket() {
    if (!isLoggedIn()) return;
    ensureSocketClientLoaded(() => {
        try {
            socket = window.io(API_BASE, { auth: { token: getCurrentUserToken() } });
            socket.on('connect', () => {
                console.log('Socket connected', socket.id);
            });
            socket.on('cartUpdated', (data) => {
                // data: { items: [...], totalAmount }
                const serverCart = (data.items || []).map(i => ({ productId: String(i.id || i.product || i._id), quantity: i.quantity }));
                saveCart(serverCart);
                // optional: trigger UI update callback if provided
                document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: serverCart, total: data.totalAmount } }));
            });
            socket.on('orderCreated', (order) => {
                // refresh orders for current user
                fetchAndStoreUserOrders();
                document.dispatchEvent(new CustomEvent('order:created', { detail: { order } }));
            });
            socket.on('newOrder', (order) => {
                // admin notification
                document.dispatchEvent(new CustomEvent('admin:newOrder', { detail: { order } }));
            });
        } catch (e) {
            console.error('Socket init failed', e);
        }
    });
}

function getEmailSubscribers() {
    const subs = localStorage.getItem('emailSubscribers');
    return subs ? JSON.parse(subs) : [];
}

function saveEmailSubscriber(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    const subscribers = getEmailSubscribers();
    if (!subscribers.includes(normalized)) {
        subscribers.push(normalized);
        localStorage.setItem('emailSubscribers', JSON.stringify(subscribers));
    }
    return normalized;
}

function isEmailSubscriber(email) {
    if (!email) return false;
    return getEmailSubscribers().includes(email.trim().toLowerCase());
}

function getCustomerOrderCount(email) {
    if (!email) return 0;
    const normalizedEmail = email.trim().toLowerCase();
    return getAllOrders().filter(order => {
        const orderEmail = (order.userEmail || order.email || '').trim().toLowerCase();
        return orderEmail === normalizedEmail;
    }).length;
}

function getCustomerTotalPurchasedQuantity(email) {
    if (!email) return 0;
    const normalizedEmail = email.trim().toLowerCase();
    return getAllOrders()
        .filter(order => {
            const orderEmail = (order.userEmail || order.email || '').trim().toLowerCase();
            return orderEmail === normalizedEmail;
        })
        .reduce((sum, order) => sum + order.items.reduce((sub, item) => sub + item.quantity, 0), 0);
}

function getRecommendedCustomerDiscountCode(email) {
    if (!email) return null;
    const orderCount = getCustomerOrderCount(email);
    const totalPurchasedQuantity = getCustomerTotalPurchasedQuantity(email);
    if (orderCount >= 1 && totalPurchasedQuantity > 5) {
        return 'LOYAL10';
    }
    return 'EMAIL10';
}

// Cart
function getCart() {
    const local = localStorage.getItem(STORAGE_CART_KEY);
    const cached = local ? JSON.parse(local) : [];
    if (isLoggedIn()) {
        // refresh cart in background from server and update cache
        fetch(`${API_BASE}/api/cart`, { headers: getAuthHeaders() })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && Array.isArray(data.items)) {
                    const serverCart = data.items.map(i => ({
                        productId: String(i.id || i.product || i._id),
                        quantity: i.quantity,
                        name: i.name || (i.product && i.product.name) || '',
                        price: i.price || (i.product && i.product.price) || 0,
                        image: i.image || (i.product && i.product.image) || ''
                    }));
                    saveCart(serverCart);
                    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: serverCart, total: data.totalAmount } }));
                }
            })
            .catch(() => { });
    }
    return cached;
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId, quantity = 1, options = {}) {
    const normalizedProductId = String(productId);
    options = options || {};
    if (isLoggedIn()) {
        // call backend
        return fetch(`${API_BASE}/api/cart`, {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders()),
            body: JSON.stringify({ productId: normalizedProductId, quantity }),
        })
            .then(async (r) => {
                if (!r.ok) {
                    const errorData = await r.json().catch(() => null);
                    throw errorData || new Error('Thêm sản phẩm vào giỏ hàng thất bại.');
                }
                return fetch(`${API_BASE}/api/cart`, { headers: getAuthHeaders() });
            })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && Array.isArray(data.items)) {
                    const serverCart = data.items.map(i => ({
                        productId: String(i.id || i.product || i._id),
                        quantity: i.quantity,
                        name: i.name || (i.product && i.product.name) || '',
                        price: i.price || (i.product && i.product.price) || 0,
                        image: i.image || (i.product && i.product.image) || '',
                        options: i.options || (i.product && i.product.options) || {}
                    }));
                    saveCart(serverCart);
                    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: serverCart, total: data.totalAmount } }));
                    return data;
                }
                throw new Error('Giỏ hàng từ server không hợp lệ.');
            })
            .catch((e) => {
                console.error('Backend cart add failed, fallback to local cart:', e);
                const cart = getCart();
                const existing = cart.find(item => String(item.productId) === normalizedProductId && JSON.stringify(item.options || {}) === JSON.stringify(options));
                if (existing) {
                    existing.quantity += quantity;
                } else {
                    cart.push({ productId: normalizedProductId, quantity, options });
                }
                saveCart(cart);
                document.dispatchEvent(new CustomEvent('cart:updated', {
                    detail: {
                        cart, total: cart.reduce((sum, item) => {
                            const product = getProductById(item.productId);
                            return sum + ((product?.price || 0) * item.quantity);
                        }, 0)
                    }
                }));
                return null;
            });
    }
    const cart = getCart();
    const existing = cart.find(item => String(item.productId) === normalizedProductId && JSON.stringify(item.options || {}) === JSON.stringify(options));
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ productId: normalizedProductId, quantity, options });
    }
    saveCart(cart);
    document.dispatchEvent(new CustomEvent('cart:updated', {
        detail: {
            cart, total: cart.reduce((sum, item) => {
                const product = getProductById(item.productId);
                return sum + ((product?.price || 0) * item.quantity);
            }, 0)
        }
    }));
}

function removeFromCartItem(productId) {
    const normalizedProductId = String(productId);
    if (isLoggedIn()) {
        return fetch(`${API_BASE}/api/cart/${encodeURIComponent(normalizedProductId)}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        })
            .then(async (r) => {
                if (!r.ok) {
                    const errorData = await r.json().catch(() => null);
                    throw errorData || new Error('Xóa sản phẩm khỏi giỏ hàng thất bại.');
                }
                return fetch(`${API_BASE}/api/cart`, { headers: getAuthHeaders() });
            })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && Array.isArray(data.items)) {
                    const serverCart = data.items.map(i => ({
                        productId: String(i.id || i.product || i._id),
                        quantity: i.quantity,
                        name: i.name || (i.product && i.product.name) || '',
                        price: i.price || (i.product && i.product.price) || 0,
                        image: i.image || (i.product && i.product.image) || ''
                    }));
                    saveCart(serverCart);
                    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: serverCart, total: data.totalAmount } }));
                    return data;
                }
                throw new Error('Giỏ hàng từ server không hợp lệ.');
            }).catch((e) => {
                console.error('Backend remove cart failed, fallback to local cart:', e);
                let cart = getCart();
                cart = cart.filter(item => String(item.productId) !== normalizedProductId);
                saveCart(cart);
                document.dispatchEvent(new CustomEvent('cart:updated', {
                    detail: {
                        cart, total: cart.reduce((sum, item) => {
                            const product = getProductById(item.productId);
                            return sum + ((product?.price || 0) * item.quantity);
                        }, 0)
                    }
                }));
                return null;
            });
    }
    let cart = getCart();
    cart = cart.filter(item => String(item.productId) !== normalizedProductId);
    saveCart(cart);
    document.dispatchEvent(new CustomEvent('cart:updated', {
        detail: {
            cart, total: cart.reduce((sum, item) => {
                const product = getProductById(item.productId);
                return sum + ((product?.price || 0) * item.quantity);
            }, 0)
        }
    }));
}

function updateCartQuantity(productId, change) {
    const normalizedProductId = String(productId);
    if (isLoggedIn()) {
        return fetch(`${API_BASE}/api/cart`, { headers: getAuthHeaders() })
            .then(r => r.ok ? r.json() : { items: [] })
            .then(data => {
                const serverCart = (data.items || []).map(i => ({ productId: String(i.id || i.product || i._id), quantity: i.quantity }));
                const item = serverCart.find(i => String(i.productId) === normalizedProductId);
                const newQuantity = (item ? item.quantity : 0) + change;
                const requestOptions = newQuantity <= 0 ? {
                    method: 'DELETE',
                    headers: getAuthHeaders(),
                } : {
                    method: 'PUT',
                    headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders()),
                    body: JSON.stringify({ quantity: newQuantity }),
                };
                return fetch(`${API_BASE}/api/cart/${encodeURIComponent(normalizedProductId)}`, requestOptions)
                    .then(async (r) => {
                        if (!r.ok) {
                            const errorData = await r.json().catch(() => null);
                            throw errorData || new Error('Cập nhật giỏ hàng thất bại.');
                        }
                        return fetch(`${API_BASE}/api/cart`, { headers: getAuthHeaders() });
                    })
                    .then(r => r.ok ? r.json() : null)
                    .then(data2 => {
                        if (data2 && Array.isArray(data2.items)) {
                            const serverCart2 = data2.items.map(i => ({
                                productId: String(i.id || i.product || i._id),
                                quantity: i.quantity,
                                name: i.name || (i.product && i.product.name) || '',
                                price: i.price || (i.product && i.product.price) || 0,
                                image: i.image || (i.product && i.product.image) || ''
                            }));
                            saveCart(serverCart2);
                            document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: serverCart2, total: data2.totalAmount } }));
                            return data2;
                        }
                        throw new Error('Giỏ hàng từ server không hợp lệ.');
                    });
            }).catch((e) => {
                console.error('Backend update cart failed, fallback to local cart:', e);
                const cart = getCart();
                const item = cart.find(i => String(i.productId) === normalizedProductId);
                if (item) {
                    item.quantity += change;
                    let newCart = cart;
                    if (item.quantity <= 0) {
                        newCart = cart.filter(i => String(i.productId) !== normalizedProductId);
                    }
                    saveCart(newCart);
                    document.dispatchEvent(new CustomEvent('cart:updated', {
                        detail: {
                            cart: newCart, total: newCart.reduce((sum, it) => {
                                const product = getProductById(it.productId);
                                return sum + ((product?.price || 0) * it.quantity);
                            }, 0)
                        }
                    }));
                }
                return null;
            });
    }
    const cart = getCart();
    const item = cart.find(i => String(i.productId) === normalizedProductId);
    if (item) {
        item.quantity += change;
        let newCart = cart;
        if (item.quantity <= 0) {
            newCart = cart.filter(i => String(i.productId) !== normalizedProductId);
        }
        saveCart(newCart);
        document.dispatchEvent(new CustomEvent('cart:updated', {
            detail: {
                cart: newCart, total: newCart.reduce((sum, it) => {
                    const product = getProductById(it.productId);
                    return sum + ((product?.price || 0) * it.quantity);
                }, 0)
            }
        }));
    }
}

function clearCart() {
    if (isLoggedIn()) {
        // backend will clear cart after successful checkout; for client-side
        saveCart([]);
        return Promise.resolve();
    }
    localStorage.setItem('cart', JSON.stringify([]));
}

// Orders
function getAllOrders() {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
}

function saveOrder(order) {
    const orders = getAllOrders();
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

function saveAllOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function getUserOrders() {
    if (isLoggedIn()) {
        return fetchAndStoreUserOrders().then(() => {
            const currentUser = getCurrentUser();
            const allOrders = getAllOrders();
            return allOrders.filter(order => order.userEmail === currentUser.email);
        });
    }
    if (!isLoggedIn()) return [];
    const currentUser = getCurrentUser();
    const allOrders = getAllOrders();
    return allOrders.filter(order => order.userEmail === currentUser.email);
}

function fetchAndStoreUserOrders() {
    if (!isLoggedIn()) return Promise.resolve([]);

    return fetch(`${API_BASE}/api/orders/my`, { headers: getAuthHeaders() })
        .then(r => r.ok ? r.json() : [])
        .then(orders => {
            const mapped = (orders || []).map(o => ({
                id: String(o._id || o.id || o.orderId || ''),
                userEmail: o.customerEmail || o.email || (o.user && o.user.email) || getCurrentUser()?.email || '',
                fullname: o.fullname || o.customerName || o.name || '',
                phone: o.phone || '',
                shippingAddress: o.shippingAddress || o.address || '',
                email: o.email || o.customerEmail || getCurrentUser()?.email || '',
                paymentMethod: o.paymentMethod || 'cash',
                items: (o.items || []).map(i => ({
                    productId: String(i.product || i.productId || i.id || i._id || ''),
                    quantity: Number(i.quantity) || 1,
                    name: i.name || (i.product && i.product.name) || '',
                    price: Number(i.price || (i.product && i.product.price)) || 0,
                    image: i.image || (i.product && i.product.image) || ''
                })),
                total: Number(o.totalAmount || o.total) || 0,
                date: o.date || o.createdAt || new Date().toISOString(),
                createdAt: o.createdAt || o.date || new Date().toISOString(),
                status: o.status || 'pending',
                estimatedDeliveryDate: o.estimatedDeliveryDate || '',
                discountCode: o.discountCode || '',
                discountAmount: Number(o.discountAmount) || 0,
            }));

            saveAllOrders(mapped);
            return mapped;
        })
        .catch(() => Promise.resolve([]));
}

function createOrder(fullname, phone, address, email, paymentMethod, cartItems, discountCode = '', discountAmount = 0) {
    const orderDate = new Date();
    const estimatedDelivery = new Date(orderDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);
    const baseTotal = calculateOrderTotal(cartItems);
    const total = Math.max(0, baseTotal - (discountAmount || 0));
    const normalizedEmail = email.trim().toLowerCase();

    const order = {
        id: 'ORD-' + Date.now(),
        date: orderDate.toISOString(),
        userEmail: getCurrentUser()?.email?.trim().toLowerCase() || normalizedEmail,
        fullname,
        phone,
        shippingAddress: address,
        email: normalizedEmail,
        paymentMethod,
        items: cartItems,
        status: 'processing',
        estimatedDeliveryDate: estimatedDelivery.toISOString(),
        discountCode: discountCode ? discountCode.toUpperCase() : '',
        discountAmount: discountAmount || 0,
        total
    };

    saveOrder(order);
    updateProductSales(cartItems);
    return order;
}

function updateProductSales(cartItems) {
    const products = getAllProducts();
    cartItems.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.sold = (product.sold || 0) + item.quantity;
        }
    });
    saveProducts(products);
}

function getOrderStatusLabel(status) {
    const labels = {
        'pending': 'Chờ xác nhận',
        'processing': 'Đang xử lý',
        'shipped': 'Đã gửi',
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy'
    };
    return labels[status] || 'Đang chờ';
}

function getOrderStatusMessage(order) {
    const deliveryDate = getOrderDeliveryDate(order);
    const displayDate = deliveryDate ? formatDateString(deliveryDate) : 'đang xử lý';
    const messages = {
        'pending': `Đơn hàng đang chờ xác nhận. Dự kiến giao vào khoảng ${displayDate}.`,
        'processing': `Đơn hàng đang được chuẩn bị. Dự kiến giao vào khoảng ${displayDate}.`,
        'shipped': `Đơn hàng đã rời kho và đang giao đến bạn. Dự kiến giao vào khoảng ${displayDate}.`,
        'delivered': `Đơn hàng đã giao vào khoảng ${displayDate}.`,
        'cancelled': 'Đơn hàng đã bị hủy.'
    };
    return messages[order.status] || `Đơn hàng đang cập nhật. Dự kiến giao vào khoảng ${displayDate}.`;
}

function getOrderDeliveryDate(order) {
    if (order.estimatedDeliveryDate) {
        return order.estimatedDeliveryDate;
    }
    if (order.date) {
        const estimated = new Date(order.date);
        estimated.setDate(estimated.getDate() + 4);
        return estimated.toISOString();
    }
    return null;
}

function formatDateString(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('vi-VN');
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function getAllActivityLogs() {
    const logs = localStorage.getItem(STORAGE_ACTIVITY_KEY);
    return logs ? JSON.parse(logs) : [];
}

function saveActivityLogs(logs) {
    localStorage.setItem(STORAGE_ACTIVITY_KEY, JSON.stringify(logs));
}

function logUserActivity(action) {
    const currentUser = getCurrentUser();
    const logs = getAllActivityLogs();
    const newLog = {
        id: 'ACT-' + Date.now(),
        userEmail: currentUser?.email || 'guest',
        fullname: currentUser?.fullname || 'Khách',
        action,
        page: window.location.pathname,
        duration: 0,
        createdAt: new Date().toISOString()
    };
    logs.push(newLog);
    saveActivityLogs(logs);
    sessionStorage.setItem('currentActivityId', newLog.id);
    sessionStorage.setItem('sessionStart', new Date().toISOString());
}

function setupActivityTracking() {
    if (!sessionStorage.getItem('sessionStart')) {
        sessionStorage.setItem('sessionStart', new Date().toISOString());
    }
    window.addEventListener('beforeunload', recordActivitySession);
}

function recordActivitySession() {
    const start = sessionStorage.getItem('sessionStart');
    const activityId = sessionStorage.getItem('currentActivityId');
    if (!start || !activityId) return;

    const durationSeconds = Math.max(1, Math.round((new Date() - new Date(start)) / 1000));
    const logs = getAllActivityLogs();
    const activity = logs.find(entry => entry.id === activityId);
    if (activity) {
        activity.duration = (activity.duration || 0) + durationSeconds;
        saveActivityLogs(logs);
    }
    sessionStorage.removeItem('sessionStart');
    sessionStorage.removeItem('currentActivityId');
}

function getActivitySummary() {
    const logs = getAllActivityLogs();
    const totalTime = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const uniqueUsers = new Set(logs.map(log => log.userEmail)).size;
    const sessions = logs.length;
    return { logs, totalTime, uniqueUsers, sessions };
}

function getSalesSummary() {
    const orders = getAllOrders().filter(order => order.status !== 'cancelled');
    const today = new Date();
    const salesToday = orders
        .filter(order => new Date(order.date).toLocaleDateString() === today.toLocaleDateString())
        .reduce((sum, order) => sum + order.total, 0);
    const salesThisMonth = orders
        .filter(order => {
            const date = new Date(order.date);
            return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        })
        .reduce((sum, order) => sum + order.total, 0);
    const salesThisYear = orders
        .filter(order => new Date(order.date).getFullYear() === today.getFullYear())
        .reduce((sum, order) => sum + order.total, 0);
    return { salesToday, salesThisMonth, salesThisYear };
}

function getSalesByCategory() {
    const orders = getAllOrders().filter(order => order.status !== 'cancelled');
    const categoryTotals = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            const product = getProductById(item.productId);
            if (!product) return;
            categoryTotals[product.category] = (categoryTotals[product.category] || 0) + product.price * item.quantity;
        });
    });
    return categoryTotals;
}

function getRepeatPurchaseRate() {
    const orders = getAllOrders();
    const customerOrders = {};
    orders.forEach(order => {
        if (!customerOrders[order.userEmail]) customerOrders[order.userEmail] = 0;
        customerOrders[order.userEmail] += 1;
    });
    const customers = Object.keys(customerOrders);
    if (customers.length === 0) return 0;
    const repeaters = customers.filter(email => customerOrders[email] > 1).length;
    return Math.round((repeaters / customers.length) * 100);
}

function getCustomerSatisfactionRate() {
    const ratings = getAllProducts().map(product => product.rating || 0);
    if (ratings.length === 0) return 0;
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return Math.round((averageRating / 5) * 100);
}

function getProfitEstimate() {
    const orders = getAllOrders().filter(order => order.status !== 'cancelled');
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    return Math.round(revenue * 0.3);
}

function getLowInteractionProducts(threshold = 180) {
    return getAllProducts()
        .filter(product => product.sold < threshold)
        .sort((a, b) => a.sold - b.sold)
        .slice(0, 5);
}

function getTopSellingProducts(count = 5) {
    return getAllProducts()
        .sort((a, b) => b.sold - a.sold)
        .slice(0, count);
}

function getAdminChatMessages() {
    const messages = localStorage.getItem(STORAGE_CHAT_KEY);
    return messages ? JSON.parse(messages) : [];
}

function saveAdminChatMessage(message) {
    const messages = getAdminChatMessages();
    messages.push(message);
    localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
}

function calculateOrderTotal(cartItems) {
    let subtotal = 0;
    cartItems.forEach(item => {
        const product = getProductById(item.productId);
        if (product) {
            subtotal += product.price * item.quantity;
        }
    });

    const shipping = subtotal > 500000 ? 0 : 50000;
    const tax = subtotal * 0.1;
    return subtotal + shipping + tax;
}

function calculateCartSubtotal(cartItems) {
    return cartItems.reduce((sum, item) => {
        const product = getProductById(item.productId);
        return product ? sum + product.price * item.quantity : sum;
    }, 0);
}

function hasUsedDiscountCode(email, code) {
    if (!email || !code) return false;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim().toUpperCase();
    return getAllOrders().some(order => {
        const orderEmail = (order.userEmail || order.email || '').trim().toLowerCase();
        return orderEmail === normalizedEmail && order.discountCode === normalizedCode;
    });
}

function getDiscountInfo(code, subtotal, shipping, tax, email = '') {
    const normalized = code.trim().toUpperCase();
    const coupons = {
        'VIP10': { type: 'percent', value: 10, description: 'Giảm 10% cho đơn hàng VIP' },
        'EMAIL10': { type: 'percent', value: 10, description: 'Giảm 10% cho khách hàng đăng ký email' },
        'LOYAL10': { type: 'percent', value: 10, description: 'Giảm 10% cho khách hàng thân thiết mua 5+ sản phẩm' },
        'FASHION50': { type: 'fixed', value: 50000, description: 'Giảm 50.000đ' },
        'FREESHIP': { type: 'shipping', value: 0, description: 'Miễn phí vận chuyển' },
        'TREND15': { type: 'percent', value: 15, description: 'Giảm 15% cho đơn hàng thời thượng' }
    };
    const coupon = coupons[normalized];
    if (!coupon) {
        return { valid: false, amount: 0, description: '' };
    }

    if (normalized === 'EMAIL10' && email) {
        if (hasUsedDiscountCode(email, normalized)) {
            return { valid: false, amount: 0, description: 'Mã EMAIL10 đã được sử dụng. Hiệu lực chỉ 1 lần cho mỗi email.' };
        }
    }

    const totalBeforeDiscount = subtotal + shipping + tax;
    let amount = 0;
    if (coupon.type === 'percent') {
        amount = Math.round((totalBeforeDiscount * coupon.value) / 100);
    } else if (coupon.type === 'fixed') {
        amount = coupon.value;
    } else if (coupon.type === 'shipping') {
        amount = shipping;
    }
    return { valid: true, amount: Math.min(amount, totalBeforeDiscount), description: coupon.description };
}

// ==================== AUTHENTICATION FUNCTIONS ====================

async function register(fullname, phone, address, email, password) {
    try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: fullname, email, password }),
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        const user = {
            id: data.user.id || data.user._id || `USR-${Date.now()}`,
            fullname: data.user.name || fullname,
            email: data.user.email,
            role: data.user.role || 'customer',
            token: data.token,
            createdAt: new Date().toISOString(),
        };
        saveCurrentUser(user);
        await syncProductsFromServer();
        // initialize realtime socket and fetch orders
        initSocket();
        await fetchAndStoreUserOrders().catch(() => { });
        return true;
    } catch (error) {
        // Fallback to localStorage registration if backend unavailable
        if (findUserByEmail(email) || (phone && findUserByPhone(phone))) {
            return false;
        }

        const user = {
            id: 'USR-' + Date.now(),
            fullname,
            phone,
            address,
            email,
            password,
            role: 'customer',
            createdAt: new Date().toISOString(),
        };

        const saved = saveUser(user);
        if (saved) {
            saveCurrentUser(user);
        }
        return saved;
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            if (result.message) {
                throw new Error(result.message);
            }
            return false;
        }

        const data = await response.json();
        const user = {
            id: data.user.id || data.user._id || `USR-${Date.now()}`,
            fullname: data.user.name || email,
            email: data.user.email,
            role: data.user.role || 'customer',
            token: data.token,
            createdAt: new Date().toISOString(),
        };
        saveCurrentUser(user);
        await syncProductsFromServer();
        return true;
    } catch (error) {
        // Fallback to localStorage login if backend unavailable
        const user = findUserByEmail(email) || findUserByPhone(email);
        if (user && user.password === password) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function initSocialAuth() {
    if (socialAuthInitialized) return;
    if (!/login\.html$|register\.html$/.test(window.location.pathname)) return;

    if (typeof google === 'undefined' || !google.accounts?.oauth2?.initTokenClient) {
        setTimeout(initSocialAuth, 300);
    } else if (!googleTokenClient) {
        googleTokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
            callback: async (tokenResponse) => {
                if (tokenResponse.access_token) {
                    try {
                        await handleGoogleAccessToken(tokenResponse.access_token);
                    } catch (err) {
                        console.error('Google login error', err);
                    }
                }
            }
        });
    }

    if (typeof FB === 'undefined') {
        window.fbAsyncInit = function () {
            FB.init({
                appId: FB_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
        };
        if (!document.getElementById('facebook-jssdk')) {
            const fbScript = document.createElement('script');
            fbScript.id = 'facebook-jssdk';
            fbScript.src = 'https://connect.facebook.net/vi_VN/sdk.js';
            fbScript.async = true;
            fbScript.defer = true;
            document.head.appendChild(fbScript);
        }
    }

    socialAuthInitialized = true;
}

window.addEventListener('load', initSocialAuth);

function googleLogin() {
    initSocialAuth();
    return new Promise((resolve, reject) => {
        if (!googleTokenClient) {
            reject(new Error('Google Login chưa được khởi tạo. Vui lòng thử lại sau.'));
            return;
        }
        googleLoginResolve = resolve;
        googleLoginReject = reject;
        googleTokenClient.requestAccessToken();
    });
}

async function handleGoogleAccessToken(accessToken) {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin Google.');
        }
        const profile = await response.json();
        const user = {
            id: `GOOG-${profile.sub || Date.now()}`,
            fullname: profile.name || profile.email || 'Người dùng Google',
            email: profile.email || `google_${profile.sub || Date.now()}@google.local`,
            role: 'customer',
            token: accessToken,
            picture: profile.picture || '',
            createdAt: new Date().toISOString(),
        };
        saveSocialLoginUser(user);
        await syncProductsFromServer().catch(() => { });
        initSocket();
        await fetchAndStoreUserOrders().catch(() => { });
        if (googleLoginResolve) {
            googleLoginResolve(user);
            googleLoginResolve = null;
            googleLoginReject = null;
        }
        return user;
    } catch (error) {
        if (googleLoginReject) {
            googleLoginReject(error);
            googleLoginResolve = null;
            googleLoginReject = null;
        }
        throw error;
    }
}

function facebookLogin() {
    initSocialAuth();
    return new Promise((resolve, reject) => {
        if (typeof FB === 'undefined' || !FB.login) {
            reject(new Error('Facebook SDK chưa tải xong. Vui lòng thử lại sau.'));
            return;
        }
        facebookLoginResolve = resolve;
        facebookLoginReject = reject;

        FB.login(function (response) {
            if (response.authResponse) {
                FB.api('/me', { fields: 'id,name,email,picture' }, async function (profile) {
                    if (!profile) {
                        if (facebookLoginReject) {
                            facebookLoginReject(new Error('Không lấy được thông tin Facebook.'));
                            facebookLoginResolve = null;
                            facebookLoginReject = null;
                        }
                        return;
                    }
                    const email = profile.email || `facebook_${profile.id}@facebook.local`;
                    const user = {
                        id: `FB-${profile.id}`,
                        fullname: profile.name || email,
                        email,
                        role: 'customer',
                        token: response.authResponse.accessToken,
                        picture: profile.picture?.data?.url || '',
                        createdAt: new Date().toISOString(),
                    };
                    saveSocialLoginUser(user);
                    await syncProductsFromServer().catch(() => { });
                    initSocket();
                    await fetchAndStoreUserOrders().catch(() => { });
                    if (facebookLoginResolve) {
                        facebookLoginResolve(user);
                        facebookLoginResolve = null;
                        facebookLoginReject = null;
                    }
                });
            } else {
                if (facebookLoginReject) {
                    facebookLoginReject(new Error('Đăng nhập Facebook không thành công.'));
                    facebookLoginResolve = null;
                    facebookLoginReject = null;
                }
            }
        }, { scope: 'public_profile,email' });
    });
}

function sendPhoneOtp(phone) {
    const normalized = phone.replace(/\D/g, '');
    if (!isValidPhone(normalized)) {
        return { success: false, message: 'Số điện thoại không hợp lệ. Vui lòng nhập 9-15 chữ số.' };
    }
    const otp = '123456';
    sessionStorage.setItem('phoneOtpPhone', normalized);
    sessionStorage.setItem('phoneOtpCode', otp);
    sessionStorage.setItem('phoneOtpExpires', String(Date.now() + 5 * 60 * 1000));
    return { success: true, message: 'Mã OTP đã được gửi đến số điện thoại của bạn. Vui lòng kiểm tra và nhập mã.' };
}

function verifyPhoneOtp(phone, code) {
    const normalized = phone.replace(/\D/g, '');
    const savedPhone = sessionStorage.getItem('phoneOtpPhone') || '';
    const savedCode = sessionStorage.getItem('phoneOtpCode') || '';
    const expires = Number(sessionStorage.getItem('phoneOtpExpires')) || 0;
    if (Date.now() > expires) {
        return false;
    }
    return normalized === savedPhone && String(code).trim() === savedCode;
}

function clearPhoneOtp() {
    sessionStorage.removeItem('phoneOtpPhone');
    sessionStorage.removeItem('phoneOtpCode');
    sessionStorage.removeItem('phoneOtpExpires');
}

function loginOrRegisterWithPhone(phone, fullname = '') {
    const normalized = phone.replace(/\D/g, '');
    let user = findUserByPhone(normalized);
    if (!user) {
        const email = `${normalized}@phone.local`;
        user = {
            id: `PHONE-${Date.now()}`,
            fullname: fullname || `Khách (${normalized})`,
            phone: normalized,
            email,
            role: 'customer',
            createdAt: new Date().toISOString(),
        };
        saveSocialLoginUser(user);
    } else {
        saveCurrentUser(user);
    }
    clearPhoneOtp();
    return user;
}

function verifyPassword(email, password) {
    const user = findUserByEmail(email) || findUserByPhone(email);
    return user && user.password === password;
}

// ==================== PRODUCT FUNCTIONS ====================

function getProductById(id) {
    const normalizedId = String(id).trim();
    return getAllProducts().find(p => {
        const productId = String(p.id).trim();
        return productId === normalizedId || Number(productId) === Number(normalizedId);
    });
}

function getAllProducts() {
    const cached = window.__productsCache;
    if (Array.isArray(cached)) {
        return cached;
    }
    if (window.__productsSyncStatus === 'success') {
        return [];
    }
    return getStoredProducts();
}

async function syncProductsFromServer() {
    try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                const normalized = data.map(product => ({
                    ...product,
                    id: String(product.id || product._id || ''),
                }));
                // Always replace cache with server response (may be empty [])
                window.__productsCache = normalized;
                window.__productsSyncStatus = 'success';
                return normalized;
            }
            window.__productsCache = [];
            window.__productsSyncStatus = 'success';
            return [];
        }
        console.warn('Đồng bộ sản phẩm thất bại, server trả lỗi:', res.status);
        window.__productsSyncStatus = 'failed';
        return null;
    } catch (err) {
        console.warn('Không thể đồng bộ sản phẩm từ server:', err);
        window.__productsSyncStatus = 'failed';
        return null;
    }
}


function filterProducts(searchTerm = '', category = '') {
    return getAllProducts().filter(product => {
        const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = category === '' || product.category === category;

        return matchSearch && matchCategory;
    });
}

function getNewestProducts(count = 6) {
    return [...getAllProducts()]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, count);
}

function getBestSellingProducts(count = 6) {
    return [...getAllProducts()]
        .sort((a, b) => b.sold - a.sold)
        .slice(0, count);
}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function saveBuyNowItem(item) {
    sessionStorage.setItem('buyNowItem', JSON.stringify(item));
}

function getBuyNowItem() {
    const item = sessionStorage.getItem('buyNowItem');
    return item ? JSON.parse(item) : null;
}

function clearBuyNowItem() {
    sessionStorage.removeItem('buyNowItem');
}

function setBuyNow(productId, quantity = 1) {
    if (!requireLoginBeforeAction()) return;
    const { color, size } = getSelectedProductOptions();
    saveBuyNowItem({ productId, quantity, color, size });
    window.location.href = 'checkout.html';
}

async function loadProductDetail() {
    const productId = getQueryParam('id')?.trim();
    const editMode = getQueryParam('edit') === '1';
    const container = document.getElementById('productDetailContainer');
    if (!container || !productId) {
        if (container) {
            container.innerHTML = '<div class="empty-message">Không tìm thấy sản phẩm. <a href="index.html">Quay lại</a></div>';
        }
        return;
    }

    let product = await fetchProductFromServer(productId);
    if (!product) {
        product = getProductById(productId);
    }

    const rating = Number(product?.rating) || 0;
    const sold = Number(product?.sold) || 0;
    const detailMeta = rating
        ? `<div class="product-detail-rating">⭐ ${rating} · Đã bán ${sold}</div>`
        : sold
            ? `<div class="product-detail-rating">Đã bán ${sold}</div>`
            : '';
    if (!product) {
        container.innerHTML = '<div class="empty-message">Sản phẩm không tồn tại. <a href="index.html">Quay lại</a></div>';
        return;
    }

    if (editMode && isAdmin()) {
        container.innerHTML = `
            <section class="product-edit-hero premium-panel">
                <div class="hero-badge">VIP PRO EDIT</div>
                <div class="hero-content">
                    <span class="hero-label">Sản phẩm cao cấp</span>
                    <h1>Chỉnh sửa sản phẩm siêu chuyên nghiệp</h1>
                    <p>Điều chỉnh nhanh tên, giá và ảnh với giao diện trực quan, chuẩn brand N&L Shop.</p>
                </div>
                <div class="hero-meta">
                    <div><strong>Mã sản phẩm:</strong> ${product.id}</div>
                    <div><strong>Danh mục:</strong> ${product.category}</div>
                    <div><strong>Trạng thái:</strong> <span class="status-badge status-premium">VIP Ready</span></div>
                </div>
            </section>
            <section class="product-detail-card premium-card">
                <div class="product-detail-image">${renderProductImage(product.image)}</div>
                <div class="product-detail-info premium-info">
                    <div class="product-detail-category">${product.category}</div>
                    <h2>${product.name}</h2>
                    <p class="product-detail-description">${product.description}</p>
                    <div class="product-detail-price">${product.price.toLocaleString()}đ</div>
                    ${detailMeta}
                </div>
            </section>
            <form id="editProductForm" class="product-edit-form premium-edit-form">
                <div class="edit-form-grid">
                    <div class="edit-form-column">
                        <div class="form-row">
                            <label for="editProductName">Tên sản phẩm</label>
                            <input id="editProductName" type="text" value="${escapeHtml(product.name)}" required>
                        </div>
                        <div class="form-row">
                            <label for="editProductPrice">Giá sản phẩm (VND)</label>
                            <input id="editProductPrice" type="number" min="0" value="${product.price}" required>
                        </div>
                        <div class="form-row">
                            <label for="editProductCategory">Danh mục</label>
                            <input id="editProductCategory" type="text" value="${escapeHtml(product.category)}" required>
                        </div>
                        <div class="form-row">
                            <label for="editProductDescription">Mô tả</label>
                            <textarea id="editProductDescription" rows="4" required>${escapeHtml(product.description)}</textarea>
                        </div>
                        <div class="form-row">
                            <label for="editProductStock">Số lượng tồn kho</label>
                            <input id="editProductStock" type="number" min="0" value="${Number(product.stock) || 0}" required>
                        </div>
                        <div class="form-row">
                            <label for="editProductRating">Đánh giá</label>
                            <input id="editProductRating" type="number" step="0.1" min="0" max="5" value="${Number(product.rating) || 0}" required>
                        </div>
                        <div class="form-row">
                            <label for="editProductSold">Đã bán</label>
                            <input id="editProductSold" type="number" min="0" value="${Number(product.sold) || 0}" required>
                        </div>
                        <div class="form-row">
                            <label for="editProductImageInput">Ảnh sản phẩm (URL hoặc emoji)</label>
                            <input id="editProductImageInput" type="text" value="${escapeHtml(product.image)}">
                        </div>
                        <div class="form-row">
                            <label for="editProductImageFile">Hoặc chọn ảnh từ máy</label>
                            <input id="editProductImageFile" type="file" accept="image/*">
                        </div>
                    </div>
                    <div class="edit-form-column preview-column">
                        <div class="preview-title">Xem trước ảnh</div>
                        <div id="editImagePreview" class="image-preview large-preview">${renderProductImage(product.image)}</div>
                        <div class="preview-notes">Ảnh upload sẽ tự động chuyển sang định dạng Base64 để lưu cục bộ. Bạn cũng có thể dùng emoji để giữ phong cách gọn nhẹ.</div>
                    </div>
                </div>
                <div class="form-actions form-actions-right">
                    <button type="button" class="btn btn-primary btn-wide" onclick="saveProductEdit('${product.id}')">Lưu thay đổi</button>
                    <button type="button" class="btn btn-secondary btn-wide" onclick="window.location.href='product.html?id=${encodeURIComponent(product.id)}'">Hủy</button>
                </div>
            </form>
        `;
        setupProductEditForm();
        return;
    }

    container.innerHTML = `
        <div class="product-detail-card">
            <div class="product-detail-image">${renderProductImage(product.image)}</div>
            <div class="product-detail-info">
                <div class="product-detail-category">${product.category}</div>
                <h2>${product.name}</h2>
                ${detailMeta}
                <div class="product-detail-meta">
                    <div class="product-config">
                        <div class="product-option-group">
                            <div class="option-label">Màu sắc</div>
                            <div class="option-swatch-list">
                                <button type="button" class="option-swatch option-swatch-dark product-option-button active" data-option="color" data-value="Đen" onclick="selectProductOption('color', 'Đen', this)" style="background:#111;"></button>
                                <button type="button" class="option-swatch white-swatch product-option-button" data-option="color" data-value="Trắng" onclick="selectProductOption('color', 'Trắng', this)" style="background:#fff;"></button>
                                <button type="button" class="option-swatch product-option-button" data-option="color" data-value="Hồng" onclick="selectProductOption('color', 'Hồng', this)" style="background:#ff6ec7;"></button>
                                <button type="button" class="option-swatch product-option-button" data-option="color" data-value="Xanh" onclick="selectProductOption('color', 'Xanh', this)" style="background:#00c2ff;"></button>
                            </div>
                        </div>
                        <div class="product-option-group">
                            <div class="option-label">Size</div>
                            <div class="option-size-list">
                                <button type="button" class="option-size product-option-button active" data-option="size" data-value="M" onclick="selectProductOption('size', 'M', this)">M</button>
                                <button type="button" class="option-size product-option-button" data-option="size" data-value="L" onclick="selectProductOption('size', 'L', this)">L</button>
                                <button type="button" class="option-size product-option-button" data-option="size" data-value="XL" onclick="selectProductOption('size', 'XL', this)">XL</button>
                                <button type="button" class="option-size product-option-button" data-option="size" data-value="XXL" onclick="selectProductOption('size', 'XXL', this)">XXL</button>
                            </div>
                        </div>
                    </div>
                    <div class="selected-options">Đã chọn: <span id="selected-color-label">Đen</span> • <span id="selected-size-label">M</span></div>
                </div>
                <p class="product-detail-description">${product.description}</p>
                <div class="product-detail-price">${product.price.toLocaleString()}đ</div>
                <div class="quantity-control">
                    <button type="button" onclick="updateDetailQuantity(-1)">-</button>
                    <input type="number" id="detailQuantity" value="1" min="1">
                    <button type="button" onclick="updateDetailQuantity(1)">+</button>
                </div>
                <div class="product-detail-actions">
                    <button class="btn btn-secondary" onclick="addProductDetailToCart()">Thêm vào giỏ</button>
                    <button class="btn btn-primary" onclick="setBuyNow('${product.id}', Number(document.getElementById('detailQuantity').value))">Thanh toán ngay</button>
                </div>
            </div>
        </div>
    `;
}

function setupProductEditForm() {
    const fileInput = document.getElementById('editProductImageFile');
    const imageInput = document.getElementById('editProductImageInput');
    const preview = document.getElementById('editImagePreview');

    if (fileInput) {
        fileInput.addEventListener('change', event => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                if (imageInput) {
                    imageInput.value = reader.result;
                }
                if (preview) {
                    preview.innerHTML = renderProductImage(reader.result);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    if (imageInput && preview) {
        imageInput.addEventListener('input', () => {
            preview.innerHTML = renderProductImage(imageInput.value.trim());
        });
    }
}

function isValidMongoId(value) {
    return /^[0-9a-fA-F]{24}$/.test(String(value).trim());
}

async function getAllProductsFromServer() {
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (!response.ok) return null;
        const data = await response.json();
        if (!Array.isArray(data)) return null;
        return data.map(product => ({
            ...product,
            id: String(product.id || product._id || ''),
        }));
    } catch (error) {
        return null;
    }
}

async function findServerProductByIdentifier(productId) {
    if (!productId) return null;
    const normalizedId = String(productId).trim();
    const products = await getAllProductsFromServer();
    if (!products) return null;

    const exactProduct = products.find(p => String(p._id) === normalizedId || String(p.id) === normalizedId);
    if (exactProduct) {
        return exactProduct;
    }

    const localProduct = getProductById(normalizedId);
    if (localProduct) {
        const fallbackProduct = products.find(p =>
            p.name === localProduct.name &&
            String(p.price) === String(localProduct.price) &&
            p.category === localProduct.category &&
            p.description === localProduct.description
        );
        if (fallbackProduct) {
            return fallbackProduct;
        }
    }

    return null;
}

async function fetchProductFromServer(productId) {
    if (!productId) return null;
    const normalizedId = String(productId).trim();
    let product = null;

    if (isValidMongoId(normalizedId)) {
        try {
            const response = await fetch(`${API_BASE}/api/products/${encodeURIComponent(normalizedId)}`);
            if (response.ok) {
                product = await response.json();
            }
        } catch (error) {
            product = null;
        }
    }

    if (!product) {
        product = await findServerProductByIdentifier(normalizedId);
    }

    if (!product) return null;
    return {
        ...product,
        id: String(product.id || product._id || ''),
    };
}

async function resolveProductMongoId(productId) {
    if (!productId) return null;
    const normalizedId = String(productId).trim();
    if (isValidMongoId(normalizedId)) {
        return normalizedId;
    }

    const product = await findServerProductByIdentifier(normalizedId);
    if (!product) return null;
    return String(product._id || product.id || '');
}

async function deleteProductFromServer(productId) {
    if (!productId) {
        alert('Không xác định được sản phẩm để xóa.');
        return false;
    }

    if (!isLoggedIn() || !getCurrentUserToken()) {
        alert('Vui lòng đăng nhập admin để xóa sản phẩm.');
        return false;
    }

    try {
        const actualProductId = await resolveProductMongoId(productId);
        if (!actualProductId) {
            alert('Không tìm thấy sản phẩm trên server để xóa.');
            return false;
        }

        const response = await fetch(`${API_BASE}/api/products/${encodeURIComponent(actualProductId)}`, {
            method: 'DELETE',
            headers: Object.assign({}, getAuthHeaders()),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.message || 'Xóa sản phẩm thất bại.');
        }

        // Clear known caches so UI always reloads from server
        window.__productsCache = null;
        window.__productsSyncStatus = 'pending';
        localStorage.removeItem(STORAGE_PRODUCTS_KEY);
        localStorage.removeItem('shopProducts');
        localStorage.removeItem('cachedProducts');
        await syncProductsFromServer();

        return true;
    } catch (error) {
        console.error('Lỗi xóa sản phẩm:', error);
        alert(error.message || 'Không thể xóa sản phẩm.');
        return false;
    }
}

async function saveProductEdit(productId) {
    const nameInput = document.getElementById('editProductName');
    const priceInput = document.getElementById('editProductPrice');
    const categoryInput = document.getElementById('editProductCategory');
    const descriptionInput = document.getElementById('editProductDescription');
    const stockInput = document.getElementById('editProductStock');
    const ratingInput = document.getElementById('editProductRating');
    const soldInput = document.getElementById('editProductSold');
    const imageInput = document.getElementById('editProductImageInput');

    if (!nameInput || !priceInput || !categoryInput || !descriptionInput || !stockInput || !ratingInput || !soldInput || !imageInput) {
        alert('Form chỉnh sửa sản phẩm không hợp lệ.');
        return;
    }

    const name = nameInput.value.trim();
    const price = Number(priceInput.value);
    const category = categoryInput.value.trim();
    const description = descriptionInput.value.trim();
    const stock = Number(stockInput.value);
    const rating = Number(ratingInput.value);
    const sold = Number(soldInput.value);
    const image = imageInput.value.trim();

    if (!name || Number.isNaN(price) || price < 0 || !category || !description || Number.isNaN(stock) || stock < 0 || Number.isNaN(rating) || rating < 0 || rating > 5 || Number.isNaN(sold) || sold < 0) {
        alert('Vui lòng nhập đầy đủ thông tin sản phẩm hợp lệ.');
        return;
    }

    if (!isLoggedIn() || !getCurrentUserToken()) {
        alert('Vui lòng đăng nhập admin để lưu sản phẩm.');
        return;
    }

    try {
        const actualProductId = await resolveProductMongoId(productId);
        if (!actualProductId) {
            alert('Không tìm thấy sản phẩm trên server để cập nhật.');
            return;
        }

        const response = await fetch(`${API_BASE}/api/products/${encodeURIComponent(actualProductId)}`, {
            method: 'PUT',
            headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders()),
            body: JSON.stringify({
                name,
                image: image || undefined,
                price,
                category,
                description,
                stock,
                rating,
                sold,
            }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.message || 'Cập nhật sản phẩm thất bại.');
        }

        // Clear known caches so UI always reloads from server
        localStorage.removeItem(STORAGE_PRODUCTS_KEY);
        localStorage.removeItem('shopProducts');
        localStorage.removeItem('cachedProducts');
        await syncProductsFromServer();

        alert('Cập nhật sản phẩm thành công.');
        if (isAdmin()) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Lỗi cập nhật sản phẩm:', error);
        alert(error.message || 'Không thể cập nhật sản phẩm.');
    }
}

function viewProduct(productId) {
    window.location.href = 'product.html?id=' + encodeURIComponent(productId);
}

function updateDetailQuantity(change) {
    const quantityInput = document.getElementById('detailQuantity');
    if (!quantityInput) return;
    const current = Number(quantityInput.value) || 1;
    const next = Math.max(1, current + change);
    quantityInput.value = next;
}

function selectProductOption(optionName, value, element) {
    const buttons = document.querySelectorAll(`.product-option-button[data-option="${optionName}"]`);
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn === element);
    });

    const label = document.getElementById(`selected-${optionName}-label`);
    if (label) {
        label.textContent = value;
    }
}

function getSelectedProductOptions() {
    const color = document.querySelector('.product-option-button[data-option="color"].active')?.dataset.value || 'Đen';
    const size = document.querySelector('.product-option-button[data-option="size"].active')?.dataset.value || 'M';
    return { color, size };
}

// ==================== LOGIN REQUIREMENT HELPER ====================
function requireLoginBeforeAction() {
    if (!isLoggedIn()) {
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        alert('Vui lòng đăng nhập để tiếp tục mua hàng.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// khởi tạo dữ liệu cục bộ và cố gắng đồng bộ với backend nếu có
initializeProductData();
syncProductsFromServer();
// initialize realtime connection and user orders cache if logged in
initSocket();
fetchAndStoreUserOrders().catch(() => { });

async function addProductDetailToCart() {
    if (!requireLoginBeforeAction()) return;
    
    const productId = getQueryParam('id');
    const quantity = Number(document.getElementById('detailQuantity')?.value) || 1;
    if (!productId) return;
    const { color, size } = getSelectedProductOptions();
    await addToCart(productId, quantity);
    updateCartCount();
    if (typeof displayCart === 'function') {
        displayCart();
    }
    alert(`Đã thêm vào giỏ: ${quantity} sản phẩm - Màu ${color}, Size ${size}`);
}

async function getUserPurchaseHistory() {
    const orders = await getUserOrders();
    const history = {};

    if (!orders || !Array.isArray(orders)) {
        return [];
    }

    const deliveredOrders = orders.filter(order => {
        const status = String(order.status || '').toLowerCase();
        return status === 'delivered' || status === 'đã giao';
    });

    deliveredOrders.forEach(order => {
        const orderDate = order.date || order.createdAt || order.orderDate || '';

        order.items.forEach(item => {
            const product = getProductById(item.productId);
            if (!product) return;

            if (!history[item.productId]) {
                history[item.productId] = {
                    product,
                    quantity: 0,
                    total: 0,
                    lastDate: orderDate,
                    orders: []
                };
            }

            history[item.productId].quantity += item.quantity;
            history[item.productId].total += product.price * item.quantity;
            if (new Date(orderDate) > new Date(history[item.productId].lastDate)) {
                history[item.productId].lastDate = orderDate;
            }
            history[item.productId].orders.push({
                orderId: order.id,
                quantity: item.quantity,
                date: orderDate
            });
        });
    });

    return Object.values(history).sort((a, b) => b.quantity - a.quantity);
}

// ==================== UI FUNCTIONS ====================

function initializePage() {
    initializeProductData();
    updateUserDisplay();
    updateCartCount();
    setupUserMenu();
    setupActivityTracking();
    if (typeof document !== 'undefined') {
        logUserActivity('Truy cập trang: ' + document.title);
    }
    document.addEventListener('cart:updated', () => {
        updateCartCount();
        if (typeof displayCart === 'function') {
            displayCart();
        }
    });
}

function setupUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    const userDisplay = document.getElementById('userDisplay');
    if (!userMenu || !userDisplay) return;

    userDisplay.addEventListener('click', function (event) {
        if (isLoggedIn()) {
            event.preventDefault();
            userMenu.classList.toggle('dropdown-open');
        }
    });

    document.addEventListener('click', function (event) {
        if (!userMenu.contains(event.target)) {
            userMenu.classList.remove('dropdown-open');
        }
    });
}

function updateUserDisplay() {
    const userDisplay = document.getElementById('userDisplay');
    const userMenu = userDisplay ? userDisplay.closest('.user-menu') : null;
    const accountLink = document.getElementById('accountLink');
    const ordersLink = document.getElementById('ordersLink');
    const historyLink = document.getElementById('historyLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');

    if (isLoggedIn()) {
        const user = getCurrentUser();
        userDisplay.textContent = user.fullname || user.email;
        userDisplay.href = 'account.html';
        userMenu.classList.add('logged-in');

        if (accountLink) accountLink.style.display = 'block';
        if (ordersLink) ordersLink.style.display = 'block';
        if (historyLink) historyLink.style.display = 'block';
        if (isAdmin() && document.getElementById('adminLink')) {
            document.getElementById('adminLink').style.display = 'block';
        }
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
    } else {
        userDisplay.textContent = '👤 Đăng nhập';
        userDisplay.href = 'login.html';
        userMenu.classList.remove('logged-in');
        if (accountLink) accountLink.style.display = 'none';
        if (ordersLink) ordersLink.style.display = 'none';
        if (historyLink) historyLink.style.display = 'none';
        if (document.getElementById('adminLink')) {
            document.getElementById('adminLink').style.display = 'none';
        }
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = getCart().length;
    }
}

function loadProducts(searchTerm = '', category = '') {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    const filteredProducts = filterProducts(searchTerm, category);
    container.innerHTML = '';

    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="empty-message">Không tìm thấy sản phẩm nào</div>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card uniform-product-card';

    const rating = Number(product.rating) || 0;
    const sold = Number(product.sold) || 0;
    const stars = rating > 0 ? '⭐'.repeat(Math.floor(rating)) + (rating % 1 ? '½' : '') : '';
    const ratingInfo = rating > 0 ? `<div class="product-rating">${stars} ${rating}</div>` : '';
    const salesInfo = sold > 0 ? `<div class="product-sold">Đã bán ${sold}</div>` : '';

    card.innerHTML = `
        <div class="product-image-box">
            <div class="product-card-img">${renderProductImage(product.image)}</div>
        </div>

        <div class="product-card-body">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-category">${product.category}</p>
            ${ratingInfo}
            ${salesInfo}
            <div class="product-price">${product.price.toLocaleString()}đ</div>
        </div>

        <div class="product-actions">
            <button class="btn btn-secondary" onclick="viewProduct('${product.id}')">Xem chi tiết</button>
            <button class="btn btn-primary" onclick="quickAdd('${product.id}')">Thêm vào giỏ</button>
        </div>
    `;

    return card;
}

function renderProductImage(image) {
    const value = String(image || '').trim();
    if (!value) return '';

    const isImagePath =
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('data:image/') ||
        value.startsWith('img/') ||
        value.startsWith('./img/') ||
        value.startsWith('/img/');

    if (isImagePath) {
        return `<img class="product-image-preview" src="${escapeHtml(value)}" alt="Ảnh sản phẩm">`;
    }

    return `<span class="product-emoji">${escapeHtml(value)}</span>`;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function viewProduct(productId) {
    window.location.href = 'product.html?id=' + encodeURIComponent(productId);
}

async function quickAdd(productId) {
    if (!requireLoginBeforeAction()) return;
    
    const product = getProductById(productId);
    if (!product) return;
    await addToCart(productId, 1, { color: 'Đen', size: 'M' });
    updateCartCount();
    if (typeof displayCart === 'function') {
        displayCart();
    }
    alert(`${product.name} đã được thêm vào giỏ hàng!`);
}

function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (!searchInput || !categoryFilter) return;

    // Prevent binding listeners multiple times
    if (searchInput.dataset.bound === '1' && categoryFilter.dataset.bound === '1') return;

    function updateProducts() {
        const searchTerm = searchInput.value || '';
        const category = categoryFilter.value || '';
        loadProducts(searchTerm, category);
    }

    searchInput.addEventListener('input', updateProducts);
    categoryFilter.addEventListener('change', updateProducts);

    searchInput.dataset.bound = '1';
    categoryFilter.dataset.bound = '1';
}

// ==================== INITIALIZATION ====================

// Demo data initialization - Add some test data if not exists
function initializeDemoData() {
    initializeProductData();

    const users = getAllUsers();
    if (!users.some(user => user.role === 'admin')) {
        const adminUser = {
            id: 'admin-001',
            fullname: 'Quản trị viên',
            phone: '0987654321',
            address: 'Văn phòng N&L Shop',
            email: 'admin@fashionshop.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        saveUser(adminUser);
    }

    if (!users.some(user => user.email === 'demo@fashionshop.com')) {
        const demoUser = {
            id: 'demo-001',
            fullname: 'Người dùng Demo',
            phone: '0123456789',
            address: '123 Đường Ngô Quyền, Hà Nội',
            email: 'demo@fashionshop.com',
            password: '123456',
            role: 'customer',
            createdAt: new Date().toISOString()
        };
        saveUser(demoUser);
    }

    const orders = getAllOrders();
    if (orders.length === 0) {
        const demoOrder = {
            id: 'ORD-1001',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            userEmail: 'demo@fashionshop.com',
            fullname: 'Người dùng Demo',
            phone: '0123456789',
            shippingAddress: '123 Đường Ngô Quyền, Hà Nội',
            email: 'demo@fashionshop.com',
            paymentMethod: 'cod',
            items: [
                { productId: '001', quantity: 1 },
                { productId: '004', quantity: 2 }
            ],
            status: 'delivered',
            total: 815000
        };
        saveOrder(demoOrder);
    }
}

// Initialize demo data on first load
initializeDemoData();

