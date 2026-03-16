import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = Router();

const ADMIN_USERNAME = "abbas.ali";
const ADMIN_PASSWORD_HASH = "$2b$12$aX/A0yELzYIpPGbyv91T5.kv7HF.l2sCPYeBahKvSEdcv8zxN7eZm";
const JWT_SECRET = process.env.JWT_SECRET ?? "al-ghalbi-admin-s3cr3t-k3y-2026";
const TOKEN_EXPIRY = "7d";

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      return res.status(400).json({ error: "يرجى إدخال اسم المستخدم وكلمة المرور" });
    }
    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }
    const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!valid) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    res.json({ token });
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/verify", (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "غير مخوّل" });
    }
    const token = auth.slice(7);
    jwt.verify(token, JWT_SECRET);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: "الجلسة منتهية أو غير صالحة" });
  }
});

export default router;
