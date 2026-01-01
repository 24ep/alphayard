
async function testPort(port) {
    const url = `http://localhost:${port}/api/admin/auth/login`;
    console.log(`Testing port ${port}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@bondarys.com',
                password: 'admin123'
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`[SUCCESS] Port ${port}: Login successful! Token: ${data.token ? 'YES' : 'NO'}`);
            return true;
        } else {
            const text = await response.text();
            console.log(`[FAIL] Port ${port}: HTTP ${response.status} - ${text.substring(0, 100)}`);
            return false;
        }
    } catch (error) {
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            // console.log(`[FAIL] Port ${port}: Connection refused`);
        } else {
            console.log(`[FAIL] Port ${port}: ${error.message}`);
        }
        return false;
    }
}

async function main() {
    const startPort = 3000;
    const endPort = 3010;
    let found = false;

    for (let port = startPort; port <= endPort; port++) {
        if (await testPort(port)) {
            found = true;
        }
    }

    if (!found) {
        console.log("No working backend found on ports 3000-3010.");
    }
}

main();
