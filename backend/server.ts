
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

/* =========================
   ENV VALIDATION
========================= */
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase credentials are not set");
}

/* =========================
   APP INIT
========================= */
const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   SUPABASE INIT (BACKEND)
========================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* =========================
   GEMINI INIT
========================= */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

/* =========================
   AUTH MIDDLEWARE (OPTIONAL)
========================= */
async function requireUser(req: any, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      req.user = null;
      return next();
    }

    req.user = data.user;
    next();
  } catch {
    req.user = null;
    next();
  }
}

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "AfyaMkononi API",
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   AI SYMPTOMS ENDPOINT
========================= */
app.post(
  "/api/ai/symptoms",
  requireUser,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const result = await model.generateContent(
        `You are AfyaMkononi AI.
Provide healthcare guidance for Kenya.
Never diagnose.
Always include a medical disclaimer.

User message:
${prompt}`
      );

      const text = result.response.text();

      /* Save consultation to Supabase */
      await supabase.from("consultations").insert({
        user_id: req.user?.id ?? null,
        prompt,
        response: text,
      });

      res.json({ text });
    } catch (error: any) {
      console.error("🔥 GEMINI BACKEND ERROR:", error);
      res.status(500).json({
        error: "AI processing failed",
        details: error?.message || String(error),
      });
    }
  }
);

/* =========================
   MPESA (DARJA) ENDPOINTS
========================= */
app.post("/api/payments/stkpush", async (req: Request, res: Response) => {
  const { phoneNumber, amount } = req.body;

  console.log(`Initiating M-Pesa payment of ${amount} for ${phoneNumber}`);

  res.json({
    checkoutID: "ws_CO_0000000000000000000",
    message: "Success",
  });
});

app.post("/api/payments/callback", (req: Request, res: Response) => {
  console.log("M-Pesa Callback Received", req.body);
  res.status(200).send("OK");
});

/* =========================
   VITALS API
========================= */
app.get("/api/vitals/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("vitals")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post("/api/vitals", async (req: Request, res: Response) => {
  const { user_id, type, value, unit } = req.body;

  const { error } = await supabase.from("vitals").insert({
    user_id,
    type,
    value,
    unit,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ status: "recorded" });
});

/* =========================
   SERVER START
========================= */
app.listen(PORT, () => {
  console.log(`AfyaMkononi Backend running on port ${PORT}`);
});
