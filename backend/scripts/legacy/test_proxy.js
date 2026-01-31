require('dotenv').config();
const fetch = require('node-fetch');

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const check = async (url) => {
    console.log(`Checking ${url}...`);
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${serviceKey}` }
        });
        console.log(`${url} -> ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log('Response:', text.substring(0, 200));
    } catch (e) {
        console.log(`${url} -> Failed: ${e.message}`);
    }
};

const run = async () => {
    // Expected behavior: Client hits proxy at /rest/v1/files
    // Proxy should rewrite to /files and hit PostgREST
    await check('http://localhost:54321/rest/v1/files');
};

run();
