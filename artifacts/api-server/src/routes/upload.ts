import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs/promises";

const router: IRouter = Router();

const BUCKET_ID = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";
const USE_LOCAL = !BUCKET_ID || process.env.USE_LOCAL_STORAGE === "true";
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), "uploads");

let objectStorageClient: any = null;
if (!USE_LOCAL) {
  import("../lib/objectStorage").then((m) => {
    objectStorageClient = m.objectStorageClient;
  });
}

if (USE_LOCAL) {
  fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(() => {});
}

const ALLOWED_PDF_TYPES = ["application/pdf"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_PDF_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error("نوع الملف غير مسموح، يُقبل فقط PDF"));
  },
});

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error("نوع الملف غير مسموح، يُقبل فقط JPG/PNG/WebP/GIF"));
  },
});

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadFile(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  const ext = path.extname(originalName);
  const filename = `${randomUUID()}${ext}`;

  if (USE_LOCAL) {
    await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
  } else {
    const gcsPath = `uploads/${filename}`;
    const bucket = objectStorageClient.bucket(BUCKET_ID);
    const file = bucket.file(gcsPath);
    await file.save(buffer, { contentType: mimeType, resumable: false });
  }

  return filename;
}

router.post("/pdf", pdfUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const buffer = req.file.buffer;
    const fileSize = formatFileSize(req.file.size);

    let pageCount = 1;
    try {
      const str = buffer.toString("binary");
      const pageMatches = str.match(/\/Type\s*\/Page\b/g);
      if (pageMatches && pageMatches.length > 0) {
        pageCount = pageMatches.length;
      } else {
        const countMatches = str.match(/\/Count\s+(\d+)/g);
        if (countMatches && countMatches.length > 0) {
          const counts = countMatches.map((m) => parseInt(m.replace(/\/Count\s+/, ""), 10));
          pageCount = Math.max(...counts);
        }
      }
    } catch {
      pageCount = 1;
    }

    const objectPath = await uploadFile(buffer, req.file.originalname, req.file.mimetype);
    const url = `/api/uploads/${objectPath}`;
    res.json({ url, pageCount, fileSize });
  } catch (err) {
    console.error("PDF upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.post("/image", imageUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const objectPath = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    const url = `/api/uploads/${objectPath}`;
    res.json({ url });
  } catch (err) {
    console.error("Image upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
