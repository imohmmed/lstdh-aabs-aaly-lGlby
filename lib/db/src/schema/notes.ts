import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const notesTable = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  teacherName: text("teacher_name").notNull().default("الأستاذ عباس علي الغالبي"),
  version: text("version"),
  pageCount: integer("page_count"),
  fileSize: text("file_size"),
  coverImageUrl: text("cover_image_url"),
  pdfUrl: text("pdf_url"),
  telegramDownloadUrl: text("telegram_download_url"),
  telegramPurchaseUrl: text("telegram_purchase_url"),
  price: text("price"),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notesTable.$inferSelect;
