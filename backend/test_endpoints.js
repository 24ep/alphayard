require('dotenv').config();
const fetch = require('node-fetch');

// Matches .env secret
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const checkEndpoint = async (path) => {
    const url = `http://localhost:8000${path}`;
    console.log(`Checking ${url}...`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceKey}`
            }
        });

        console.log(`Status for ${path}: ${response.status} ${response.statusText}`);

        if (response.status !== 200) {
            const text = await response.text();
            console.log('Error Body:', text);
        } else {
            console.log('OK (Table exposed)');
        }
    } catch (error) {
        console.error(`Failed to connect to ${url}:`, error.message);
    }
};

const run = async () => {
    // Check root to see if it's up
    await checkEndpoint('/');
    // Check files table
    await checkEndpoint('/files');
};

run();
