import { Router } from "express";
import { db } from "@workspace/db";
import { bannerVideosTable } from "@workspace/db/schema";
import { asc, eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const videos = await db
      .select()
      .from(bannerVideosTable)
      .orderBy(asc(bannerVideosTable.order), asc(bannerVideosTable.createdAt));
    res.json(videos);
  } catch {
    res.status(500).json({ error: "Failed to fetch banner videos" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { url, order } = req.body as { url: string; order?: number };
    if (!url) return res.status(400).json({ error: "url is required" });
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(bannerVideosTable);
    const [created] = await db
      .insert(bannerVideosTable)
      .values({ url, order: order ?? count })
      .returning();
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: "Failed to create banner video" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(bannerVideosTable).where(eq(bannerVideosTable.id, id));
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Failed to delete banner video" });
  }
});

export default router;
