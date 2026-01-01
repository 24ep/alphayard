
async function testValidLogin() {
    const url = 'http://127.0.0.1:3000/api/v1/auth/login';
    console.log(`Testing valid login at ${url}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@bondarys.com', password: 'admin123' })
        });

        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${text}`);

        if (response.ok) {
            try {
                const json = JSON.parse(text);
                if (json.accessToken || json.token) {
                    console.log('✅ Access Token present:', json.accessToken || json.token);
                } else {
                    console.log('❌ Access Token MISSING!');
                }
                if (json.user) {
                    console.log('✅ User Object present:', json.user.email);
                } else {
                    console.log('❌ User Object MISSING!');
                }
            } catch (e) {
                console.log('❌ Failed to parse JSON response');
            }
        } else {
            console.log('❌ Login failed (unexpected)');
        }
    } catch (error) {
        console.log(`❌ Network/Fetch failed: ${error.message}`);
    }
}

testValidLogin();
