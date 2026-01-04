const fetch = require('node-fetch'); // Assuming node-fetch or native fetch
// If node-fetch not available, use native fetch (Node 18+)
const nativeFetch = global.fetch;

async function testRoutes() {
    const baseUrl = 'http://localhost:4000/api/v1';
    const headers = {
        'Authorization': 'Bearer mock-access-token',
        'Content-Type': 'application/json'
    };

    console.log('Testing Chat Routes...');

    // Test 1: Check Attachment Stub (GET /attachments/:id)
    // This verifies validation of route registration in index.ts
    try {
        const res = await (nativeFetch || fetch)(`${baseUrl}/attachments/test-id`, { headers });
        console.log(`GET /attachments/test-id status: ${res.status}`);
        const text = await res.text();
        console.log('Response:', text);
        if (res.status === 200) {
            console.log('PASS: Attachment route registered.');
        } else {
            console.log('FAIL: Attachment route not accessible.');
        }
    } catch (e) {
        console.error('Error testing attachment route:', e.message);
    }

    // Test 2: Check Chat Rooms (GET /chat/families/:id/rooms)
    // Use a dummy family ID
    try {
        const familyId = 'dummy-family-id';
        const res = await (nativeFetch || fetch)(`${baseUrl}/chat/families/${familyId}/rooms`, { headers });
        console.log(`GET /chat/families/.../rooms status: ${res.status}`);
        // Might return 400 (invalid family id) or 200 (empty list) or 403.
        // As long as it's not 404, the route is registered.
        if (res.status !== 404) {
            console.log('PASS: Chat route registered.');
        } else {
            console.log('FAIL: Chat route returned 404.');
        }
    } catch (e) {
        console.error('Error testing chat route:', e.message);
    }
}

testRoutes();
