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
  const width = 160;
  const height = 56;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="100%" height="100%" fill="#1e293b" rx="8"/>`;

  for (let i = 0; i < 6; i++) {
    const x1 = randomInt(0, width);
    const y1 = randomInt(0, height);
    const x2 = randomInt(0, width);
    const y2 = randomInt(0, height);
    const opacity = (randomInt(15, 35) / 100).toFixed(2);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,${opacity})" stroke-width="1"/>`;
  }

  for (let i = 0; i < 20; i++) {
    const cx = randomInt(0, width);
    const cy = randomInt(0, height);
    const r = randomInt(1, 3);
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,0.15)"/>`;
  }

  const chars = text.split("");
  const startX = 20;
  const spacing = 24;
  chars.forEach((ch, i) => {
    const x = startX + i * spacing + randomInt(-3, 3);
    const y = 36 + randomInt(-4, 4);
    const rotate = randomInt(-15, 15);
    const colors = ["#4ade80", "#38bdf8", "#f9a8d4", "#fbbf24", "#a78bfa"];
    const color = colors[randomInt(0, colors.length)];
    svg += `<text x="${x}" y="${y}" font-family="monospace" font-size="${randomInt(22, 28)}" font-weight="bold" fill="${color}" transform="rotate(${rotate},${x},${y})">${ch}</text>`;
  });

  svg += `</svg>`;
  return svg;
}

router.get("/captcha", (_req, res) => {
  const ops = ["+", "-", "×"] as const;
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
    case "×":
      a = randomInt(2, 12);
      b = randomInt(2, 12);
      answer = a * b;
      break;
  }

  const token = randomUUID();
  captchaStore.set(token, { answer, expiresAt: Date.now() + 5 * 60 * 1000 });

  const questionText = `${a} ${op} ${b} = ?`;
  const svg = generateCaptchaSvg(questionText);

  res.json({
    token,
    image: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
  });
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
