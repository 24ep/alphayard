
const axios = require('axios');
const fs = require('fs');

async function checkBundle() {
    const url = 'http://localhost:8081/index.bundle?platform=web&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.routerRoot=app';
    try {
        console.log('Fetching bundle from:', url);
        const response = await axios.get(url);
        console.log('Success! Status:', response.status);
    } catch (error) {
        console.log('Error caught!');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
            fs.writeFileSync('bundle_error.json', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Message:', error.message);
        }
    }
}

checkBundle();
