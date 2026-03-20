import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import router from "./routes";

const app: Express = express();

const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = isProduction
  ? ["https://abbas-galiby.com", "https://www.abbas-galiby.com"]
  : undefined;

app.use(cors(allowedOrigins ? { origin: allowedOrigins, credentials: true } : {}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use((_req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "SAMEORIGIN");
  res.set("X-XSS-Protection", "1; mode=block");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (isProduction) {
    res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

const BUCKET_ID = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";
const USE_LOCAL = !BUCKET_ID || process.env.USE_LOCAL_STORAGE === "true";
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), "uploads");

if (USE_LOCAL) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  app.get("/api/uploads/*objectPath", (req, res) => {
    try {
      const raw = (req.params as any).objectPath;
      const filename = Array.isArray(raw) ? raw.join("/") : String(raw ?? "");
      if (!filename) return res.status(400).send("Missing path");

      const filePath = path.join(UPLOADS_DIR, filename);
      if (!fs.existsSync(filePath)) return res.status(404).send("Not found");

      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
      };
      const contentType = mimeTypes[ext] || "application/octet-stream";

      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      if (contentType === "application/pdf") {
        const safeName = filename.split("/").pop() || filename;
        res.set("Content-Disposition", `attachment; filename="${safeName}"`);
      }
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      console.error("Serve upload error:", err);
      res.status(500).send("Error serving file");
    }
  });
} else {
  let gcsClient: any = null;
  import("./lib/objectStorage").then((m) => {
    gcsClient = m.objectStorageClient;
  });

  app.get("/api/uploads/*objectPath", async (req, res) => {
    try {
      const raw = (req.params as any).objectPath;
      const filename = Array.isArray(raw) ? raw.join("/") : String(raw ?? "");
      if (!filename) return res.status(400).send("Missing path");
      if (!gcsClient) return res.status(503).send("Storage not ready");
      const bucket = gcsClient.bucket(BUCKET_ID);
      const file = bucket.file(`uploads/${filename}`);
      const [exists] = await file.exists();
      if (!exists) return res.status(404).send("Not found");
      const [metadata] = await file.getMetadata();
      const contentType = (metadata.contentType as string) || "application/octet-stream";
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      if (contentType === "application/pdf" || filename.endsWith(".pdf")) {
        const safeName = filename.split("/").pop() || filename;
        res.set("Content-Disposition", `attachment; filename="${safeName}"`);
      }
      file.createReadStream().pipe(res);
    } catch (err) {
      console.error("Serve upload error:", err);
      res.status(500).send("Error serving file");
    }
  });
}

app.use("/api", router);

export default app;
