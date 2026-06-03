const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 5000;

function makeRequest(path, method, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: `/api${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    try {
        console.log('Login...');
        const login = await makeRequest('/auth/login', 'POST', { email: 'admin@gmail.com', password: 'admin123' });
        if (!login.data.token) throw new Error('Login failed');
        const token = login.data.token;
        console.log('Token OK');

        console.log('Create product...');
        const create = await makeRequest('/products', 'POST', {
            name: 'CRUD Test Product',
            price: 12345,
            category: 'Test',
            description: 'Testing update sync',
            stock: 7,
            rating: 4,
            sold: 1,
            image: 'https://via.placeholder.com/150'
        }, token);
        if (create.status < 200 || create.status >= 300) throw new Error('Create failed: ' + JSON.stringify(create));
        const prod = create.data.product || create.data;
        const id = prod._id || prod.id;
        console.log('Created', id);

        console.log('Resolve _id via GET list...');
        const list = await makeRequest('/products', 'GET');
        const found = list.data.find(p => p._id === id || p.id === id || p.name === 'CRUD Test Product');
        if (!found) throw new Error('Created product not found in list');
        const realId = found._id || found.id;
        console.log('Real id:', realId);

        console.log('Update product via resolved _id...');
        const update = await makeRequest(`/products/${realId}`, 'PUT', { name: 'CRUD Test Product - Updated', price: 54321, image: 'https://via.placeholder.com/200', category: 'Test', description: 'Updated', stock: 10, rating: 4.5, sold: 2 }, token);
        console.log('Update status', update.status, update.data.message || update.data);
        if (update.status !== 200) throw new Error('Update failed');

        console.log('Verify update in list...');
        const list2 = await makeRequest('/products', 'GET');
        const found2 = list2.data.find(p => (p._id === realId || p.id === realId) && p.name === 'CRUD Test Product - Updated');
        console.log('Verified updated:', !!found2);
        if (!found2) throw new Error('Updated product not found with new name');

        console.log('Cleanup: delete product');
        const del = await makeRequest(`/products/${realId}`, 'DELETE', null, token);
        console.log('Delete status', del.status, del.data.message || del.data);
        if (del.status !== 200) throw new Error('Delete failed');

        console.log('All good');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

run();
