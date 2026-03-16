import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { objectStorageClient } from "./lib/objectStorage";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files from GCS at /api/uploads/<objectPath>
const BUCKET_ID = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";
app.get("/api/uploads/*objectPath", async (req, res) => {
  try {
    const filename = (req.params as any).objectPath;
    if (!filename) return res.status(400).send("Missing path");
    const bucket = objectStorageClient.bucket(BUCKET_ID);
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

app.use("/api", router);

export default app;
