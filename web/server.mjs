import { createServer, Server } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const STATIC_DIR = join(process.cwd(), "dist", "client");

const startEntry = (await import("./dist/server/server.js")).default;

const MIME_TYPES = {
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
};

const server = createServer(async (req, res) => {
    const url = new URL(
        req.url || "/",
        `http://${req.headers.host || "localhost"}`,
    );

    // Serve static assets
    if (url.pathname.startsWith("/assets/")) {
        const filePath = join(STATIC_DIR, url.pathname);
        try {
            const s = await stat(filePath);
            if (s.isFile()) {
                const content = await readFile(filePath);
                const ext = filePath.slice(filePath.lastIndexOf("."));
                res.setHeader(
                    "Content-Type",
                    MIME_TYPES[ext] || "application/octet-stream",
                );
                res.setHeader(
                    "Cache-Control",
                    "public, max-age=31536000, immutable",
                );
                res.writeHead(200);
                res.end(content);
                return;
            }
        } catch {}
    }

    // SSR for everything else
    try {
        const request = new Request(url, {
            method: req.method,
            headers: new Headers(req.headers),
        });
        const response = await startEntry.fetch(request);
        for (const [key, value] of response.headers.entries()) {
            if (key.toLowerCase() !== "transfer-encoding")
                res.setHeader(key, value);
        }
        res.writeHead(response.status);
        if (response.body) {
            const reader = response.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(Buffer.from(value));
            }
        }
        res.end();
    } catch (e) {
        console.error("Server error:", e);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
    }
});

server.listen(PORT, HOST, () => {
    const displayHost = HOST === "0.0.0.0" ? "localhost" : HOST;
    console.log(`Web server running on http://${displayHost}:${PORT}`);
});

export default server;
