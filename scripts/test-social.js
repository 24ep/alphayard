
async function testSocialPosts() {
    const loginUrl = 'http://127.0.0.1:3000/api/v1/auth/login';
    const postsUrl = 'http://127.0.0.1:3000/api/v1/social/posts';

    console.log('1. Logging in...');
    try {
        const loginRes = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@bondarys.com', password: 'admin123' })
        });

        if (!loginRes.ok) {
            console.log('❌ Login failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        console.log('✅ Login successful, got token');

        console.log('2. Fetching posts...');
        const postsRes = await fetch(postsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const text = await postsRes.text();
        console.log(`Status: ${postsRes.status}`);

        if (postsRes.ok) {
            const json = JSON.parse(text);
            if (json.posts && json.posts.length > 0) {
                console.log(`✅ Success! Found ${json.posts.length} posts.`);
                console.log('Sample Post:', json.posts[0].content);
            } else {
                console.log('⚠️ Success, but no posts returned.');
            }
        } else {
            console.log('❌ Fetch posts failed:', text);
        }

    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

testSocialPosts();
