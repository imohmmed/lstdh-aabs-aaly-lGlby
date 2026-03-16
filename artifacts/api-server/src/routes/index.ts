import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import notesRouter from "./notes";
import uploadRouter from "./upload";
import ratingsRouter from "./ratings";
import statsRouter from "./stats";
import bannerRouter from "./banner";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/categories", categoriesRouter);
router.use("/notes", notesRouter);
router.use("/upload", uploadRouter);
router.use("/ratings", ratingsRouter);
router.use("/stats", statsRouter);
router.use("/banner-videos", bannerRouter);

export default router;
