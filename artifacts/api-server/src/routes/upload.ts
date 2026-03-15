import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

router.post("/pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileBuffer = fs.readFileSync(req.file.path);
    const fileSize = formatFileSize(req.file.size);

    let pageCount = 1;
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(fileBuffer);
      pageCount = data.numpages;
    } catch {
      pageCount = 1;
    }

    const baseUrl = process.env.BASE_URL || "";
    const url = `${baseUrl}/api/uploads/${req.file.filename}`;

    res.json({
      url,
      pageCount,
      fileSize,
      filename: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

router.post("/image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const baseUrl = process.env.BASE_URL || "";
    const url = `${baseUrl}/api/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
