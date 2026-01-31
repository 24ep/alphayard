require('dotenv').config();
const fetch = require('node-fetch'); // Assuming node-fetch is available or using native fetch in newer node

// Native fetch (Node 18+)
const performRequest = async () => {
    const url = 'http://localhost:8000/';
    const token = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Testing connection to:', url);
    console.log('Using Token (first 20 chars):', token ? token.substring(0, 20) : 'MISSING');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

performRequest();
