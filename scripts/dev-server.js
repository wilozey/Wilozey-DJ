const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4173;
const root = path.resolve(__dirname, '..');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function send(res, code, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(body);
}

http
  .createServer((req, res) => {
    const reqPath = req.url === '/' ? '/public/index.html' : req.url;
    const filePath = path.join(root, reqPath);

    if (!filePath.startsWith(root)) return send(res, 403, 'Forbidden');
    fs.readFile(filePath, (err, data) => {
      if (err) return send(res, 404, 'Not found');
      const ext = path.extname(filePath);
      send(res, 200, data, mime[ext] || 'application/octet-stream');
    });
  })
  .listen(PORT, () => {
    console.log(`Plantinel MVP dev server running at http://localhost:${PORT}`);
  });
