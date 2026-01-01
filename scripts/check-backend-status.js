
async function checkBackend() {
    const url = `http://localhost:3000/api/admin/auth/login`;
    console.log(`Checking backend at ${url}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test', password: 'test' })
        });
        console.log(`Backend is reachable. Status: ${response.status}`);
    } catch (error) {
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            console.log("Backend connection refused. Server is likely down.");
        } else {
            console.log(`Backend check failed: ${error.message}`);
        }
    }
}

checkBackend();
