const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const TARGET_URL = 'http://localhost:8000';
const LISTEN_PORT = 54321;

// Error handling
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    if (res.writeHead) {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end('Something went wrong in the proxy.');
    }
});

const server = http.createServer((req, res) => {
    const originalUrl = req.url;

    // Rewrite /rest/v1/xxx -> /xxx
    if (req.url.startsWith('/rest/v1')) {
        req.url = req.url.replace('/rest/v1', '');
    }

    console.log(`[PROXY] ${req.method} ${originalUrl} -> ${TARGET_URL}${req.url}`);

    proxy.web(req, res, { target: TARGET_URL });
});

console.log(`Gateway Proxy listening on port ${LISTEN_PORT}`);
console.log(`Forwarding /rest/v1/* to ${TARGET_URL}/*`);

server.listen(LISTEN_PORT);
