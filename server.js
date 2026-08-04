const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3300;
const PUBLIC_DIR = path.join(__dirname, "public");       // Vite build output (React app)
const ADMIN_DIR = path.join(__dirname, "admin");         // config dashboard (plain HTML/CSS/JS, no build step)
const CONFIG_PATH = path.join(__dirname, "config.json"); // single source of truth, outside public/ and admin/

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

// Serves static files out of baseDir. If spaFallback is true, unknown paths
// fall back to baseDir/index.html (used for the React app's client routing).
function serveFromDir(baseDir, urlPath, res, { spaFallback } = {}) {
  if (urlPath === "" || urlPath === "/") urlPath = "/index.html";

  const filePath = path.join(baseDir, urlPath);
  if (!filePath.startsWith(baseDir)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (spaFallback) {
        return fs.readFile(path.join(baseDir, "index.html"), (err2, indexData) => {
          if (err2) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            return res.end("Not found: " + urlPath + " (did you run `npm run build` in /frontend?)");
          }
          res.writeHead(200, { "Content-Type": MIME[".html"] });
          res.end(indexData);
        });
      }
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
  const urlPath = decodeURIComponent(req.url.split("?")[0]);

  if (urlPath.startsWith("/api/config")) {
    return handleConfigApi(req, res);
  }

  if (urlPath === "/admin" || urlPath.startsWith("/admin/")) {
    const rest = urlPath.replace(/^\/admin/, "") || "/";
    return serveFromDir(ADMIN_DIR, rest, res);
  }

  serveFromDir(PUBLIC_DIR, urlPath, res, { spaFallback: true });
});

server.listen(PORT, () => {
  console.log(`Adire Hotels app running at http://localhost:${PORT}`);
  console.log(`Config dashboard at http://localhost:${PORT}/admin`);
  console.log(`Edit config.json (or PUT to /api/config) to update styles and hotel data.`);
});
