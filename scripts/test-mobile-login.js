
async function testMobileLogin() {
    const url = 'http://127.0.0.1:3000/api/v1/auth/login';
    console.log(`Testing mobile login at ${url}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
        });

        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${text.substring(0, 500)}`);

        if (response.ok) {
            console.log('✅ Mobile login endpoint is working!');
        } else {
            console.log('⚠️ Mobile login endpoint returned error (expected for invalid credentials)');
        }
    } catch (error) {
        console.log(`❌ Mobile login failed: ${error.message}`);
    }
}

testMobileLogin();
