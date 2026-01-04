require('dotenv').config();
const fetch = require('node-fetch');

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const check = async (url) => {
    console.log(`Checking ${url}...`);
    try {
        const res = await fetch(url + '/files', {
            headers: { 'Authorization': `Bearer ${serviceKey}` }
        });
        console.log(`${url}/files -> ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log('Response:', text.substring(0, 200));
    } catch (e) {
        console.log(`${url}/files -> Failed: ${e.message}`);
    }
};

const run = async () => {
    // Raw PostgREST
    await check('http://localhost:8000');
    // What Supabase Client expects
    await check('http://localhost:8000/rest/v1');
};

run();
