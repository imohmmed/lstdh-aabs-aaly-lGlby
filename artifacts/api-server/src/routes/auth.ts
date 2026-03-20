import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID, randomInt } from "crypto";

const router = Router();

const ADMIN_USERNAME = "abbas.ali";
const ADMIN_PASSWORD_HASH = "$2b$12$aX/A0yELzYIpPGbyv91T5.kv7HF.l2sCPYeBahKvSEdcv8zxN7eZm";
const JWT_SECRET = process.env.JWT_SECRET ?? "al-ghalbi-admin-s3cr3t-k3y-2026";
const TOKEN_EXPIRY = "7d";

interface CaptchaEntry {
  answer: number;
  svg: string;
  expiresAt: number;
}

const captchaStore = new Map<string, CaptchaEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of captchaStore) {
    if (val.expiresAt < now) captchaStore.delete(key);
  }
}, 60_000);

function generateCaptchaSvg(text: string): string {
  const width = 180;
  const height = 60;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="100%" height="100%" fill="#1e293b" rx="8"/>`;

  for (let i = 0; i < 8; i++) {
    const x1 = randomInt(0, width);
    const y1 = randomInt(0, height);
    const x2 = randomInt(0, width);
    const y2 = randomInt(0, height);
    const opacity = (randomInt(15, 40) / 100).toFixed(2);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,${opacity})" stroke-width="1"/>`;
  }

  for (let i = 0; i < 25; i++) {
    const cx = randomInt(0, width);
    const cy = randomInt(0, height);
    const r = randomInt(1, 3);
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,0.15)"/>`;
  }

  const chars = text.split("");
  const totalWidth = chars.length * 22;
  const startX = Math.floor((width - totalWidth) / 2);
  chars.forEach((ch, i) => {
    const x = startX + i * 22 + randomInt(-2, 3);
    const y = 40 + randomInt(-5, 5);
    const rotate = randomInt(-18, 18);
    const colors = ["#4ade80", "#38bdf8", "#f9a8d4", "#fbbf24", "#a78bfa", "#fb923c"];
    const color = colors[randomInt(0, colors.length)];
    const size = randomInt(24, 30);
    const escaped = ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch;
    svg += `<text x="${x}" y="${y}" font-family="monospace,Courier" font-size="${size}" font-weight="bold" fill="${color}" transform="rotate(${rotate},${x},${y})">${escaped}</text>`;
  });

  for (let i = 0; i < 3; i++) {
    const cx = randomInt(20, width - 20);
    const cy = randomInt(10, height - 10);
    const rx = randomInt(20, 60);
    const ry = randomInt(10, 25);
    svg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
  }

  svg += `</svg>`;
  return svg;
}

router.get("/captcha", (_req, res) => {
  const ops = ["+", "-", "x"] as const;
  const op = ops[randomInt(0, ops.length)];
  let a: number, b: number, answer: number;

  switch (op) {
    case "+":
      a = randomInt(1, 50);
      b = randomInt(1, 50);
      answer = a + b;
      break;
    case "-":
      a = randomInt(10, 60);
      b = randomInt(1, a);
      answer = a - b;
      break;
    case "x":
      a = randomInt(2, 12);
      b = randomInt(2, 12);
      answer = a * b;
      break;
  }

  const token = randomUUID();
  const questionText = `${a} ${op} ${b} = ?`;
  const svg = generateCaptchaSvg(questionText);
  captchaStore.set(token, { answer, svg, expiresAt: Date.now() + 5 * 60 * 1000 });

  res.json({ token });
});

router.get("/captcha-image/:token", (req, res) => {
  const raw = req.params.token;
  const token = Array.isArray(raw) ? raw[0] : String(raw ?? "");
  const entry = captchaStore.get(token);
  if (!entry) {
    const fallback = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="60"><rect width="100%" height="100%" fill="#1e293b" rx="8"/><text x="90" y="35" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="sans-serif">انتهت الصلاحية</text></svg>`;
    res.set("Content-Type", "image/svg+xml");
    res.set("Cache-Control", "no-store");
    return res.send(fallback);
  }
  res.set("Content-Type", "image/svg+xml");
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.send(entry.svg);
});

router.post("/login", async (req, res) => {
  try {
    const { username, password, captchaToken, captchaAnswer } = req.body as {
      username?: string;
      password?: string;
      captchaToken?: string;
      captchaAnswer?: string | number;
    };

    if (!captchaToken || captchaAnswer === undefined || captchaAnswer === "") {
      return res.status(400).json({ error: "يرجى حل الكابتشا" });
    }

    const entry = captchaStore.get(captchaToken);
    if (!entry) {
      return res.status(400).json({ error: "الكابتشا منتهية، اضغط تحديث" });
    }

    captchaStore.delete(captchaToken);

    if (entry.expiresAt < Date.now()) {
      return res.status(400).json({ error: "الكابتشا منتهية، اضغط تحديث" });
    }

    if (Number(captchaAnswer) !== entry.answer) {
      return res.status(400).json({ error: "إجابة الكابتشا غير صحيحة" });
    }

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
