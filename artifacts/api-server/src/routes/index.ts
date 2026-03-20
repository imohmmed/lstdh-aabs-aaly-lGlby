import { Router, type IRouter } from "express";
import { requireAdmin } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimiter";
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

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, name: "login" });
const uploadLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, name: "upload" });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, name: "api" });

router.use(healthRouter);

router.use("/auth", loginLimiter, authRouter);

router.use("/categories", apiLimiter, categoriesRouter);
router.use("/notes", apiLimiter, notesRouter);
router.use("/ratings", apiLimiter, ratingsRouter);
router.use("/stats", apiLimiter, statsRouter);

router.use("/banner-videos", apiLimiter, bannerRouter);
router.use("/settings", apiLimiter, settingsRouter);
router.use("/upload", requireAdmin, uploadLimiter, uploadRouter);
router.use("/bot", botRouter);

export default router;
