import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { notesTable } from "./notes";

export const ratingsTable = pgTable("ratings", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull().references(() => notesTable.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  fingerprint: text("fingerprint").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Rating = typeof ratingsTable.$inferSelect;
