import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

async function testAuthFlow() {
    try {
        console.log('1. Attempting login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'jaroonwitpool@gmail.com', // Using the email from previous context
            password: 'password' // Assuming a default or asking user/resetting might be needed, but verifying flow first
        });

        console.log('Login successful:', loginRes.data.success);
        const { accessToken, refreshToken, user } = loginRes.data;
        console.log('Tokens received.');
        console.log('Access Token:', accessToken.substring(0, 20) + '...');
        console.log('Refresh Token:', refreshToken.substring(0, 20) + '...');

        console.log('\n2. Verifying /auth/me with new access token...');
        const meRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log('/auth/me success:', meRes.data.success);

        console.log('\n3. Attempting refresh token...');
        const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
        });

        console.log('Refresh successful:', refreshRes.data.success);
        const { accessToken: newAccess, refreshToken: newRefresh } = refreshRes.data;
        console.log('New Access Token:', newAccess.substring(0, 20) + '...');
        console.log('New Refresh Token:', newRefresh.substring(0, 20) + '...');

        if (newRefresh === refreshToken) {
            console.warn('WARNING: Refresh token did not rotate!');
        } else {
            console.log('Refresh token rotated successfully.');
        }

        console.log('\n4. Verifying /auth/me with NEW access token...');
        const meRes2 = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${newAccess}` }
        });
        console.log('/auth/me (after refresh) success:', meRes2.data.success);

        console.log('\n5. Attempting to REUSE OLD refresh token (Expected Failure)...');
        try {
            await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken
            });
            console.error('ERROR: Old refresh token WAS accepted! (Security risk/Logic bug)');
        } catch (err: any) {
            if (err.response?.status === 401) {
                console.log('Success: Old refresh token rejected with 401 as expected.');
            } else {
                console.error('Unexpected error reusing old token:', err.message);
            }
        }

    } catch (error: any) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

testAuthFlow();
