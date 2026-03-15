import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  UpdateCategoryParams,
  DeleteCategoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  try {
    const categories = await db
      .select()
      .from(categoriesTable)
      .orderBy(categoriesTable.order);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateCategoryBody.parse(req.body);
    const [created] = await db.insert(categoriesTable).values(body).returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = UpdateCategoryParams.parse({ id: Number(req.params.id) });
    const body = UpdateCategoryBody.parse(req.body);
    const [updated] = await db
      .update(categoriesTable)
      .set(body)
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeleteCategoryParams.parse({ id: Number(req.params.id) });
    const [deleted] = await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
