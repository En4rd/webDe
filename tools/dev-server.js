const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 5501);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const MIME_TYPES = {
    ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif",
    ".mp3": "audio/mpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon"
};

function titleFromFolder(id) {
    const match = id.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    const name = (match ? match[2] : id).replace(/[-_]+/g, " ");
    return name.replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("es-MX"));
}

function dateFromFolder(id) {
    const match = id.match(/^(\d{4})-(\d{2})-(\d{2})-/);
    if (!match) return "Un recuerdo especial";
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? "Un recuerdo especial" :
        date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function scanAlbums() {
    const memoriesPath = path.join(ROOT, "recuerdos");
    if (!fs.existsSync(memoriesPath)) return [];
    return fs.readdirSync(memoriesPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && /^[a-zA-Z0-9_-]+$/.test(entry.name))
        .map((entry) => {
            const id = entry.name;
            const folder = path.join(memoriesPath, id);
            const metadataPath = path.join(folder, ".album.json");
            let metadata = {};
            if (fs.existsSync(metadataPath)) {
                try { metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8")); }
                catch (error) { console.warn("Metadata inválida en " + metadataPath, error.message); }
            }
            const photos = fs.readdirSync(folder, { withFileTypes: true })
                .filter((file) => file.isFile() && IMAGE_EXTENSIONS.has(path.extname(file.name).toLowerCase()))
                .sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true }))
                .map((file) => ({
                    src: "recuerdos/" + encodeURIComponent(id) + "/" + encodeURIComponent(file.name),
                    caption: path.basename(file.name, path.extname(file.name)).replace(/[-_]+/g, " ")
                }));
            return {
                id,
                title: metadata.title || titleFromFolder(id),
                date: metadata.date || dateFromFolder(id),
                description: metadata.description || "Cada fotografía guarda un pedacito de nuestra historia. 💛",
                cover: metadata.cover || "",
                photos,
                local: true,
                published: fs.existsSync(path.join(folder, ".published"))
            };
        })
        .sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true }));
}

function sendJson(response, status, value) {
    response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    response.end(JSON.stringify(value));
}

function serveStatic(request, response, pathname) {
    let decoded;
    try { decoded = decodeURIComponent(pathname); }
    catch { response.writeHead(400); response.end("Bad request"); return; }

    const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
    const filePath = path.resolve(ROOT, relative);
    if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
        response.writeHead(403); response.end("Forbidden"); return;
    }
    if (relative.split(/[\\/]/).some((part) => part.startsWith(".") || part === "tools")) {
        response.writeHead(404); response.end("Not found"); return;
    }
    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) { response.writeHead(404); response.end("Not found"); return; }
        const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
        response.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
        fs.createReadStream(filePath).pipe(response);
    });
}

const server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (request.method === "GET" && url.pathname === "/__albums") {
        return sendJson(response, 200, { albums: scanAlbums() });
    }
    const albumRoute = url.pathname.match(/^\/__albums\/([a-zA-Z0-9_-]+)$/);
    if (request.method === "GET" && albumRoute) {
        const album = scanAlbums().find((item) => item.id === albumRoute[1]);
        return sendJson(response, album ? 200 : 404, album ? { album } : { error: "Álbum no encontrado" });
    }
    const publishRoute = url.pathname.match(/^\/__albums\/([a-zA-Z0-9_-]+)\/publication$/);
    if (request.method === "POST" && publishRoute) {
        let body = "";
        request.on("data", (chunk) => { body += chunk; if (body.length > 1024) request.destroy(); });
        request.on("end", () => {
            try {
                const payload = JSON.parse(body || "{}");
                if (typeof payload.published !== "boolean") return sendJson(response, 400, { error: "published debe ser booleano" });
                const folder = path.join(ROOT, "recuerdos", publishRoute[1]);
                if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) return sendJson(response, 404, { error: "Álbum no encontrado" });
                const marker = path.join(folder, ".published");
                if (payload.published) fs.writeFileSync(marker, "Publicado de forma intencional.\n", "utf8");
                else if (fs.existsSync(marker)) fs.unlinkSync(marker);
                return sendJson(response, 200, { published: payload.published });
            } catch (error) {
                return sendJson(response, 400, { error: "Solicitud inválida" });
            }
        });
        return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405); response.end("Method not allowed"); return;
    }
    serveStatic(request, response, url.pathname);
});

server.listen(PORT, "127.0.0.1", () => {
    console.log("Servidor local listo: http://127.0.0.1:" + PORT);
    console.log("Álbumes detectados: " + scanAlbums().length);
    console.log("Presiona Ctrl+C para detenerlo.");
});
