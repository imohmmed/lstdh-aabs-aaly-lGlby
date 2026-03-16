import { Router } from "express";
import { db } from "@workspace/db";
import { notesTable, categoriesTable, ratingsTable, siteSettingsTable } from "@workspace/db/schema";
import { eq, and, sql, ilike, like } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

const router = Router();

const BASE_URL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : process.env.BASE_URL || "";

function toAbsolute(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

async function getBotApiKey(): Promise<string> {
  const rows = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, "bot_api_key"));
  return rows[0]?.value || "";
}

async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = getBotApiKey();
  const storedKey = await key;

  if (!storedKey) {
    return res.status(503).json({ error: "Bot API key not configured. Set it in the admin panel." });
  }

  const provided =
    req.headers["x-api-key"] ||
    (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");

  if (!provided || provided !== storedKey) {
    return res.status(401).json({ error: "Invalid or missing API key." });
  }

  next();
}

async function getNoteData(noteId: number) {
  const [note] = await db
    .select({
      id: notesTable.id,
      title: notesTable.title,
      teacherName: notesTable.teacherName,
      version: notesTable.version,
      price: notesTable.price,
      pageCount: notesTable.pageCount,
      fileSize: notesTable.fileSize,
      coverImageUrl: notesTable.coverImageUrl,
      pdfUrl: notesTable.pdfUrl,
      categoryId: notesTable.categoryId,
      categoryName: categoriesTable.name,
      createdAt: notesTable.createdAt,
      updatedAt: notesTable.updatedAt,
    })
    .from(notesTable)
    .leftJoin(categoriesTable, eq(notesTable.categoryId, categoriesTable.id))
    .where(eq(notesTable.id, noteId));

  if (!note) return null;

  const [rating] = await db
    .select({
      avg: sql<number>`coalesce(avg(${ratingsTable.rating}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(ratingsTable)
    .where(eq(ratingsTable.noteId, noteId));

  return {
    id: note.id,
    title: note.title,
    category: note.categoryName || null,
    version: note.version || null,
    teacherName: note.teacherName || null,
    price: note.price || null,
    pageCount: note.pageCount || null,
    fileSize: note.fileSize || null,
    coverImageUrl: toAbsolute(note.coverImageUrl),
    pdfUrl: toAbsolute(note.pdfUrl),
    averageRating: rating?.avg ? Number(rating.avg).toFixed(1) : null,
    ratingCount: Number(rating?.count ?? 0),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

/* GET /api/bot/notes — all notes with optional filters
   Query params:
     ?category=سادس       — filter by category name (partial, case-insensitive)
     ?categoryId=1        — filter by category ID (exact)
     ?teacher=عباس        — filter by teacher name (partial, case-insensitive)
     ?search=ملزمة        — filter by note title (partial, case-insensitive)
     ?hasFile=true        — only notes that have a PDF file
*/
router.get("/notes", requireApiKey, async (req, res) => {
  try {
    const { category, categoryId, teacher, search, hasFile } = req.query as Record<string, string>;

    const conditions: any[] = [];

    if (categoryId) {
      conditions.push(eq(notesTable.categoryId, Number(categoryId)));
    }
    if (category) {
      conditions.push(ilike(categoriesTable.name, `%${category}%`));
    }
    if (teacher) {
      conditions.push(ilike(notesTable.teacherName, `%${teacher}%`));
    }
    if (search) {
      conditions.push(ilike(notesTable.title, `%${search}%`));
    }
    if (hasFile === "true") {
      conditions.push(sql`${notesTable.pdfUrl} IS NOT NULL AND ${notesTable.pdfUrl} != ''`);
    }

    const notes = await db
      .select({ id: notesTable.id })
      .from(notesTable)
      .leftJoin(categoriesTable, eq(notesTable.categoryId, categoriesTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(notesTable.updatedAt);

    const results = await Promise.all(notes.map((n) => getNoteData(n.id)));
    res.json(results.filter(Boolean));
  } catch (err) {
    console.error("Bot notes error:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

/* GET /api/bot/notes/:id — single note */
router.get("/notes/:id", requireApiKey, async (req, res) => {
  try {
    const noteId = Number(req.params.id);
    if (isNaN(noteId)) return res.status(400).json({ error: "Invalid note ID" });

    const note = await getNoteData(noteId);
    if (!note) return res.status(404).json({ error: "Note not found" });

    res.json(note);
  } catch (err) {
    console.error("Bot note error:", err);
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

export default router;
