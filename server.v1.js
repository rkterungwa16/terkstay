const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const CONFIG_PATH = path.join(PUBLIC_DIR, "config.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = path.join(PUBLIC_DIR, urlPath);

  // Guard against path traversal outside /public
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found: " + urlPath);
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

// GET /api/config  -> current config.json
// PUT /api/config  -> overwrite config.json with the request body (basic CMS "save")
function handleConfigApi(req, res) {
  if (req.method === "GET") {
    fs.readFile(CONFIG_PATH, "utf8", (err, data) => {
      if (err) return sendJSON(res, 500, { error: "Could not read config.json" });
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(data);
    });
    return;
  }

  if (req.method === "PUT") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFile(CONFIG_PATH, JSON.stringify(parsed, null, 2), (err) => {
          if (err) return sendJSON(res, 500, { error: "Could not write config.json" });
          sendJSON(res, 200, { ok: true });
        });
      } catch (e) {
        sendJSON(res, 400, { error: "Invalid JSON: " + e.message });
      }
    });
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain" });
  res.end("Method not allowed");
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/config")) {
    return handleConfigApi(req, res);
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Adire Hotels app running at http://localhost:${PORT}`);
  console.log(`Edit public/config.json (or PUT to /api/config) to update styles and hotel data.`);
});
