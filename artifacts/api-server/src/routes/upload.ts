import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { objectStorageClient } from "../lib/objectStorage";

const router: IRouter = Router();

const BUCKET_ID = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadToGCS(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  const ext = path.extname(originalName);
  const filename = `${randomUUID()}${ext}`;
  const gcsPath = `uploads/${filename}`;
  const bucket = objectStorageClient.bucket(BUCKET_ID);
  const file = bucket.file(gcsPath);
  await file.save(buffer, { contentType: mimeType, resumable: false });
  // Return just filename — served at /api/uploads/<filename>
  return filename;
}

router.post("/pdf", upload.single("file"), async (req, res) => {
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

    const objectPath = await uploadToGCS(buffer, req.file.originalname, req.file.mimetype);
    const url = `/api/uploads/${objectPath}`;
    res.json({ url, pageCount, fileSize });
  } catch (err) {
    console.error("PDF upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.post("/image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const objectPath = await uploadToGCS(req.file.buffer, req.file.originalname, req.file.mimetype);
    const url = `/api/uploads/${objectPath}`;
    res.json({ url });
  } catch (err) {
    console.error("Image upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
