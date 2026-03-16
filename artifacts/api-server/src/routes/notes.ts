import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notesTable, categoriesTable, ratingsTable, statsEventsTable } from "@workspace/db/schema";
import { eq, and, ilike, sql, ne } from "drizzle-orm";
import {
  GetNotesQueryParams,
  CreateNoteBody,
  GetNoteByIdParams,
  UpdateNoteParams,
  UpdateNoteBody,
  DeleteNoteParams,
  GetSimilarNotesParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getNoteWithStats(noteId: number) {
  const [note] = await db
    .select({
      id: notesTable.id,
      title: notesTable.title,
      teacherName: notesTable.teacherName,
      version: notesTable.version,
      pageCount: notesTable.pageCount,
      fileSize: notesTable.fileSize,
      coverImageUrl: notesTable.coverImageUrl,
      pdfUrl: notesTable.pdfUrl,
      telegramDownloadUrl: notesTable.telegramDownloadUrl,
      telegramPurchaseUrl: notesTable.telegramPurchaseUrl,
      price: notesTable.price,
      categoryId: notesTable.categoryId,
      categoryName: categoriesTable.name,
      updatedAt: notesTable.updatedAt,
      createdAt: notesTable.createdAt,
    })
    .from(notesTable)
    .leftJoin(categoriesTable, eq(notesTable.categoryId, categoriesTable.id))
    .where(eq(notesTable.id, noteId));

  if (!note) return null;

  const ratingStats = await db
    .select({
      avg: sql<number>`coalesce(avg(${ratingsTable.rating}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(ratingsTable)
    .where(eq(ratingsTable.noteId, noteId));

  return {
    ...note,
    averageRating: ratingStats[0]?.avg ? Number(ratingStats[0].avg) : null,
    ratingCount: Number(ratingStats[0]?.count ?? 0),
  };
}

router.get("/", async (req, res) => {
  try {
    const query = GetNotesQueryParams.parse({
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      search: req.query.search as string | undefined,
    });

    const conditions = [];
    if (query.categoryId) conditions.push(eq(notesTable.categoryId, query.categoryId));
    if (query.search) conditions.push(ilike(notesTable.title, `%${query.search}%`));

    const notes = await db
      .select({
        id: notesTable.id,
        title: notesTable.title,
        teacherName: notesTable.teacherName,
        version: notesTable.version,
        pageCount: notesTable.pageCount,
        fileSize: notesTable.fileSize,
        coverImageUrl: notesTable.coverImageUrl,
        pdfUrl: notesTable.pdfUrl,
        telegramDownloadUrl: notesTable.telegramDownloadUrl,
        telegramPurchaseUrl: notesTable.telegramPurchaseUrl,
        price: notesTable.price,
        categoryId: notesTable.categoryId,
        categoryName: categoriesTable.name,
        updatedAt: notesTable.updatedAt,
        createdAt: notesTable.createdAt,
      })
      .from(notesTable)
      .leftJoin(categoriesTable, eq(notesTable.categoryId, categoriesTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(notesTable.updatedAt);

    const notesWithRatings = await Promise.all(
      notes.map(async (note) => {
        const ratingStats = await db
          .select({
            avg: sql<number>`coalesce(avg(${ratingsTable.rating}), 0)`,
            count: sql<number>`count(*)`,
          })
          .from(ratingsTable)
          .where(eq(ratingsTable.noteId, note.id));
        return {
          ...note,
          averageRating: ratingStats[0]?.avg ? Number(ratingStats[0].avg) : null,
          ratingCount: Number(ratingStats[0]?.count ?? 0),
        };
      })
    );

    res.json(notesWithRatings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateNoteBody.parse(req.body);
    const [created] = await db
      .insert(notesTable)
      .values({
        ...body,
        updatedAt: new Date(),
      })
      .returning();
    const note = await getNoteWithStats(created.id);
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetNoteByIdParams.parse({ id: Number(req.params.id) });
    const note = await getNoteWithStats(id);
    if (!note) return res.status(404).json({ error: "Not found" });

    const statsCounts = await db
      .select({
        eventType: statsEventsTable.eventType,
        count: sql<number>`count(*)`,
      })
      .from(statsEventsTable)
      .where(eq(statsEventsTable.noteId, id))
      .groupBy(statsEventsTable.eventType);

    const statsMap = statsCounts.reduce(
      (acc, s) => ({ ...acc, [s.eventType]: Number(s.count) }),
      {} as Record<string, number>
    );

    res.json({
      ...note,
      viewCount: statsMap["view"] ?? 0,
      downloadClickCount: statsMap["download_click"] ?? 0,
      previewClickCount: statsMap["preview_click"] ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = UpdateNoteParams.parse({ id: Number(req.params.id) });
    const body = UpdateNoteBody.parse(req.body);
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    for (const [key, value] of Object.entries(body)) {
      if (value !== null && value !== undefined) updateData[key] = value;
    }
    const [updated] = await db
      .update(notesTable)
      .set(updateData)
      .where(eq(notesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    const note = await getNoteWithStats(id);
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeleteNoteParams.parse({ id: Number(req.params.id) });
    const [deleted] = await db
      .delete(notesTable)
      .where(eq(notesTable.id, id))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/:id/similar", async (req, res) => {
  try {
    const { id } = GetSimilarNotesParams.parse({ id: Number(req.params.id) });
    const [currentNote] = await db
      .select({ categoryId: notesTable.categoryId })
      .from(notesTable)
      .where(eq(notesTable.id, id));
    if (!currentNote) return res.json([]);

    const similar = await db
      .select({
        id: notesTable.id,
        title: notesTable.title,
        teacherName: notesTable.teacherName,
        version: notesTable.version,
        pageCount: notesTable.pageCount,
        fileSize: notesTable.fileSize,
        coverImageUrl: notesTable.coverImageUrl,
        pdfUrl: notesTable.pdfUrl,
        telegramDownloadUrl: notesTable.telegramDownloadUrl,
        telegramPurchaseUrl: notesTable.telegramPurchaseUrl,
        price: notesTable.price,
        categoryId: notesTable.categoryId,
        categoryName: categoriesTable.name,
        updatedAt: notesTable.updatedAt,
        createdAt: notesTable.createdAt,
      })
      .from(notesTable)
      .leftJoin(categoriesTable, eq(notesTable.categoryId, categoriesTable.id))
      .where(and(eq(notesTable.categoryId, currentNote.categoryId), ne(notesTable.id, id)))
      .limit(10);

    const withRatings = await Promise.all(
      similar.map(async (note) => {
        const ratingStats = await db
          .select({
            avg: sql<number>`coalesce(avg(${ratingsTable.rating}), 0)`,
            count: sql<number>`count(*)`,
          })
          .from(ratingsTable)
          .where(eq(ratingsTable.noteId, note.id));
        return {
          ...note,
          averageRating: ratingStats[0]?.avg ? Number(ratingStats[0].avg) : null,
          ratingCount: Number(ratingStats[0]?.count ?? 0),
        };
      })
    );
    res.json(withRatings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch similar notes" });
  }
});

export default router;
