import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ratingsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { SubmitRatingBody, GetRatingByNoteParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const body = SubmitRatingBody.parse(req.body);

    const existing = await db
      .select()
      .from(ratingsTable)
      .where(
        and(
          eq(ratingsTable.noteId, body.noteId),
          eq(ratingsTable.fingerprint, body.fingerprint)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Already rated" });
    }

    await db.insert(ratingsTable).values({
      noteId: body.noteId,
      rating: body.rating,
      fingerprint: body.fingerprint,
    });

    const stats = await db
      .select({
        avg: sql<number>`coalesce(avg(${ratingsTable.rating}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(ratingsTable)
      .where(eq(ratingsTable.noteId, body.noteId));

    res.status(201).json({
      success: true,
      averageRating: Number(stats[0]?.avg ?? 0),
      ratingCount: Number(stats[0]?.count ?? 0),
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/:noteId", async (req, res) => {
  try {
    const { noteId } = GetRatingByNoteParams.parse({ noteId: Number(req.params.noteId) });

    const stats = await db
      .select({
        avg: sql<number>`coalesce(avg(${ratingsTable.rating}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(ratingsTable)
      .where(eq(ratingsTable.noteId, noteId));

    res.json({
      noteId,
      averageRating: stats[0]?.avg ? Number(stats[0].avg) : null,
      ratingCount: Number(stats[0]?.count ?? 0),
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
