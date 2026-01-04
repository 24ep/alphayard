const API_URL = 'http://localhost:4000/api/v1';

async function testAuthAndSocial() {
    console.log('Testing Auth and Social...');

    try {
        // 1. Test Refresh Token (Simulation of apiClient refresh)
        console.log('\n--- Testing Refresh Token ---');
        try {
            const refreshRes = await fetch(`${API_URL} /auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: 'mock-refresh-token' })
            });

            console.log('Refresh Status:', refreshRes.status);
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                console.log('New Access Token:', data.accessToken ? 'Present' : 'Missing');
            } else {
                console.error('Refresh Failed:', await refreshRes.text());
            }
        } catch (error: any) {
            console.error('Refresh Error:', error.message);
        }

        // 2. Test Social Post with Mock Token
        console.log('\n--- Testing Create Post with mock-access-token ---');
        try {
            const postRes = await fetch(`${API_URL} /social/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer mock-access-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: 'Test post from verification script',
                    media_urls: [],
                    familyId: '1db23c4a-6e39-4467-b50a-8bf88174f762', // Assuming this family exists or use one from DB
                    location: 'Test Location'
                })
            });

            console.log('Create Post Status:', postRes.status);
            if (postRes.ok) {
                const data = await postRes.json();
                console.log('Post ID:', data.id);
            } else {
                console.error('Create Post Failed:', await postRes.text());
            }
        } catch (error: any) {
            console.error('Create Post Error:', error.message);
        }

    } catch (error) {
        console.error('Global Error:', error);
    }
}

testAuthAndSocial();
