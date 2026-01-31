
const axios = require('axios');

async function testAdminFlow() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post('http://localhost:4000/api/v1/admin/auth/login', {
            email: 'admin@bondarys.com',
            password: 'password'
        });
        const token = loginRes.data.token;
        console.log('Login Successful!');

        console.log('2. Accessing /api/v1/admin/applications...');
        const appRes = await axios.get('http://localhost:4000/api/v1/admin/applications', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Access Successful!');
        console.log('Applications count:', appRes.data.length || (appRes.data.applications ? appRes.data.applications.length : 'unknown'));
    } catch (error) {
        console.error('Flow Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAdminFlow();
