import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { notesTable } from "./notes";

export const statsEventsTable = pgTable("stats_events", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull().references(() => notesTable.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // "view" | "download_click" | "preview_click"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type StatsEvent = typeof statsEventsTable.$inferSelect;
