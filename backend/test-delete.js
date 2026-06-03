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

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testDelete() {
    try {
        // 1. Login
        console.log('1. Logging in...');
        const login = await makeRequest('/auth/login', 'POST', {
            email: 'admin@gmail.com',
            password: 'admin123'
        });
        
        if (!login.data.token) {
            console.log('Login response:', login);
            throw new Error('Login failed: ' + JSON.stringify(login.data));
        }
        
        const token = login.data.token;
        console.log('✓ Login successful, token:', token.substring(0, 20) + '...');

        // 2. Create test product
        console.log('\n2. Creating test product...');
        const create = await makeRequest('/products', 'POST', {
            name: 'Test DELETE Product',
            price: 99999,
            category: 'Test',
            description: 'Delete test',
            stock: 5,
            rating: 4.5,
            sold: 2,
            image: 'https://via.placeholder.com/300'
        }, token);
        
        if (create.status !== 201 && create.status !== 200) {
            console.log('Create response:', create);
            throw new Error('Create product failed: ' + JSON.stringify(create.data));
        }
        
        const productId = create.data.product?._id || create.data._id;
        console.log('✓ Created product ID:', productId);
        if (!productId) {
            console.log('Create response:', create);
            throw new Error('No _id in create response');
        }

        // 3. Verify creation
        console.log('\n3. Verifying product exists...');
        const list = await makeRequest('/products', 'GET');
        const found = list.data.find(p => p._id === productId);
        console.log(found ? '✓ Product found in list' : '✗ Product NOT found');

        // 4. DELETE product
        console.log('\n4. Deleting product with _id...');
        const deleteRes = await makeRequest(`/products/${productId}`, 'DELETE', null, token);
        console.log(`✓ DELETE response: ${deleteRes.status} - ${deleteRes.data.message}`);

        // 5. Verify deletion
        console.log('\n5. Verifying product deleted...');
        const list2 = await makeRequest('/products', 'GET');
        const found2 = list2.data.find(p => p._id === productId);
        console.log(found2 ? '✗ Product still exists (ERROR!)' : '✓ Product deleted successfully!');

        console.log('\n✅ DELETE test complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testDelete();

