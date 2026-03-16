import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import notesRouter from "./notes";
import uploadRouter from "./upload";
import ratingsRouter from "./ratings";
import statsRouter from "./stats";
import bannerRouter from "./banner";
import authRouter from "./auth";
import settingsRouter from "./settings";
import botRouter from "./bot";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/categories", categoriesRouter);
router.use("/notes", notesRouter);
router.use("/upload", uploadRouter);
router.use("/ratings", ratingsRouter);
router.use("/stats", statsRouter);
router.use("/banner-videos", bannerRouter);
router.use("/auth", authRouter);
router.use("/settings", settingsRouter);
router.use("/bot", botRouter);

export default router;
