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
import { requireAdmin } from "../middleware/auth";

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

router.post("/", requireAdmin, async (req, res) => {
  try {
    const body = CreateCategoryBody.parse(req.body);
    const insertValues: Record<string, unknown> = {
      name: body.name,
      icon: body.icon ?? null,
      order: body.order,
      parentId: body.parentId ?? null,
    };
    const [created] = await db
      .insert(categoriesTable)
      .values(insertValues as any)
      .returning();
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = UpdateCategoryParams.parse({ id: Number(req.params.id) });
    const partial = UpdateCategoryBody.partial().parse(req.body);
    const updateData: Record<string, unknown> = {};
    if (partial.name !== undefined) updateData.name = partial.name;
    if (partial.icon !== undefined) updateData.icon = partial.icon;
    if (partial.order !== undefined) updateData.order = partial.order;
    if ("parentId" in partial) updateData.parentId = partial.parentId ?? null;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const [updated] = await db
      .update(categoriesTable)
      .set(updateData as any)
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
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
