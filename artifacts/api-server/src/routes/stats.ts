import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { statsEventsTable, notesTable, ratingsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { RecordEventBody, GetNoteStatsParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/event", async (req, res) => {
  try {
    const body = RecordEventBody.parse(req.body);
    await db.insert(statsEventsTable).values({
      noteId: body.noteId,
      eventType: body.eventType,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const notes = await db.select({ id: notesTable.id, title: notesTable.title }).from(notesTable);

    const allStats = await Promise.all(
      notes.map(async (note) => {
        const eventCounts = await db
          .select({
            eventType: statsEventsTable.eventType,
            count: sql<number>`count(*)`,
          })
          .from(statsEventsTable)
          .where(eq(statsEventsTable.noteId, note.id))
          .groupBy(statsEventsTable.eventType);

        const statsMap = eventCounts.reduce(
          (acc, s) => ({ ...acc, [s.eventType]: Number(s.count) }),
          {} as Record<string, number>
        );

        const ratingStats = await db
          .select({
            avg: sql<number>`coalesce(avg(${ratingsTable.rating}), 0)`,
            count: sql<number>`count(*)`,
          })
          .from(ratingsTable)
          .where(eq(ratingsTable.noteId, note.id));

        return {
          noteId: note.id,
          noteTitle: note.title,
          viewCount: statsMap["view"] ?? 0,
          downloadClickCount: statsMap["download_click"] ?? 0,
          previewClickCount: statsMap["preview_click"] ?? 0,
          averageRating: ratingStats[0]?.avg ? Number(ratingStats[0].avg) : null,
          ratingCount: Number(ratingStats[0]?.count ?? 0),
        };
      })
    );

    res.json(allStats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/:noteId", async (req, res) => {
  try {
    const { noteId } = GetNoteStatsParams.parse({ noteId: Number(req.params.noteId) });

    const [note] = await db
      .select({ title: notesTable.title })
      .from(notesTable)
      .where(eq(notesTable.id, noteId));

    const eventCounts = await db
      .select({
        eventType: statsEventsTable.eventType,
        count: sql<number>`count(*)`,
      })
      .from(statsEventsTable)
      .where(eq(statsEventsTable.noteId, noteId))
      .groupBy(statsEventsTable.eventType);

    const statsMap = eventCounts.reduce(
      (acc, s) => ({ ...acc, [s.eventType]: Number(s.count) }),
      {} as Record<string, number>
    );

    const ratingStats = await db
      .select({
        avg: sql<number>`coalesce(avg(${ratingsTable.rating}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(ratingsTable)
      .where(eq(ratingsTable.noteId, noteId));

    res.json({
      noteId,
      noteTitle: note?.title ?? "",
      viewCount: statsMap["view"] ?? 0,
      downloadClickCount: statsMap["download_click"] ?? 0,
      previewClickCount: statsMap["preview_click"] ?? 0,
      averageRating: ratingStats[0]?.avg ? Number(ratingStats[0].avg) : null,
      ratingCount: Number(ratingStats[0]?.count ?? 0),
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
