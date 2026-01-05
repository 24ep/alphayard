const API_URL = 'http://localhost:4000/api/v1';

async function testAuthFlow() {
    try {
        const randomEmail = `testuser_${Date.now()}@example.com`;
        console.log(`1. Attempting Register with ${randomEmail}...`);

        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: randomEmail,
                password: 'password123',
                firstName: 'Test',
                lastName: 'User'
            })
        });

        const regData = await regRes.json();
        console.log('Register Status:', regRes.status);
        console.log('Register Success:', regData.success);

        if (!regData.success) {
            console.error('Register failed:', regData);
            return;
        }

        const { accessToken, refreshToken } = regData;
        console.log('Tokens received.');

        console.log('\n2. Verifying /auth/me...');
        const meRes = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const meData = await meRes.json();
        console.log('/auth/me Status:', meRes.status);

        console.log('\n3. Attempting refresh token...');
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        const refreshData = await refreshRes.json();
        console.log('Refresh Status:', refreshRes.status);
        console.log('Refresh Success:', refreshData.success);

        if (!refreshData.success) {
            console.error('Refresh Failed:', refreshData);
        } else {
            console.log('New tokens received successfully. Logic is working for new users.');
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

testAuthFlow();
