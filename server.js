// Lightweight local development server (100% Vanilla Node.js - No dependencies)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.wav': 'audio/wav',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    
    // Normalize and prevent directory traversal
    const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Support HTTP Range requests for smooth audio playback/scrubbing on mobile
        const range = req.headers.range;
        if (range && (contentType.startsWith('audio/') || contentType.startsWith('video/'))) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
            const chunksize = (end - start) + 1;
            const stream = fs.createReadStream(filePath, { start, end });
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            stream.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': stats.size,
                'Access-Control-Allow-Origin': '*'
            });
            fs.createReadStream(filePath).pipe(res);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 LOCAL SERVER RUNNING!`);
    console.log(`💻 Buka di Laptop : http://localhost:${PORT}/index.html`);
    console.log(`📱 Buka di HP (Wi-Fi): http://192.168.0.107:${PORT}/index.html`);
    console.log(`🖨️ Cetak Kartu QR : http://localhost:${PORT}/cetak-kartu-qr.html`);
    console.log(`======================================================\n`);
});
