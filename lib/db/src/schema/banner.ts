import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const bannerVideosTable = pgTable("banner_videos", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
