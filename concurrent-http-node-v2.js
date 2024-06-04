const http = require('http');
const https = require('https');

const endpoints = ['https://example1.com', 'https://example2.com', 'https://example3.com']; // Add your desired endpoints
const numRequests = 50; // Number of concurrent requests per endpoint
const delay = 60 * 1000 / numRequests; // Delay between requests in milliseconds (1 minute / numRequests)

let shouldMakeRequests = false; // Flag to indicate whether requests should be made

// Function to make HTTPS requests to multiple endpoints
function makeRequest(id, endpoint) {
    if (!shouldMakeRequests) return; // Check if requests should be made
    const startTime = new Date();
    const options = {
        hostname: endpoint.replace('https://', ''),
        port: 443,
        path: '/',
        method: 'GET',
        headers: {
            'Host': endpoint.replace('https://', ''),
            'User-Agent': 'Node.js HTTPS Client'
        }
    };
    const req = https.request(options, (res) => {
        const endTime = new Date();
        const latency = endTime - startTime;
        const logMessage = `Request ${id} to ${endpoint}: Status Code ${res.statusCode}, Destination IP ${options.hostname}, Latency ${latency}ms`;
        console.log(logMessage);
    });
    req.on('error', (err) => {
        const errorMessage = `Error in request ${id} to ${endpoint}: ${err.message}`;
        console.error(errorMessage);
    });
    req.end();
}

// Create an HTTP server
const server = http.createServer((req, res) => {
    if (req.url === '/start') {
        shouldMakeRequests = true; // Activate making requests
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Requests started\n');
    } else if (req.url === '/stop') {
        shouldMakeRequests = false; // Stop making requests
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Requests stopped\n');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found\n');
    }
});

// Listen on port 3000
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});

// Function to periodically make HTTPS requests
function startRequests() {
    if (shouldMakeRequests) {
        endpoints.forEach((endpoint) => {
            for (let i = 0; i < numRequests; i++) {
                makeRequest(i, endpoint);
            }
        });
    }
    setTimeout(startRequests, delay);
}

startRequests();
