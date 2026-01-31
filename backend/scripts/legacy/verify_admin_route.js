const http = require('http');

function checkRoute(path, method = 'GET') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`${method} ${path} -> Status: ${res.statusCode}`);
        if (res.statusCode !== 404) {
             console.log('Response:', data.substring(0, 100));
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`${method} ${path} -> Error: ${e.message}`);
      resolve();
    });

    if (method === 'POST') {
      req.write(JSON.stringify({ username: 'admin', password: 'password' }));
    }
    req.end();
  });
}

async function run() {
  console.log('Verifying Backend Routes on Port 3001...');
  await checkRoute('/api/health'); // Should be 200
  await checkRoute('/api/settings/branding'); // Should be 200 or 401 (if auth required), but currently 200 per code
  await checkRoute('/api/admin/auth/login', 'POST'); // Should be 200 or 401, NOT 404
}

run();
