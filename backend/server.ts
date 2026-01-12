
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

app.use(cors());
app.use(express.json());

// --- AI Service (Backend Proxy) ---
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

app.post("/api/ai/symptoms", async (req: Request, res: Response) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const safeHistory = Array.isArray(history)
      ? history.map((m: any) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }))
      : [];

    const result = await model.generateContent(
      `You are AfyaMkononi AI. Provide healthcare guidance for Kenya.
Never diagnose. Always include a medical disclaimer.

User message: ${prompt}`
    );

    const text = result.response.text();
    res.json({ text });

  } catch (error: any) {                 // ✅ FIX
    console.error("🔥 GEMINI BACKEND ERROR:", error);
    res.status(500).json({
      error: "AI processing failed",
      details: error?.message || String(error),
    });
  }                                       // ✅ FIX
});                                      // ✅ FIX

// --- M-Pesa Integration (Daraja API) ---
app.post("/api/payments/stkpush", async (req: Request, res: Response) => {
  const { phoneNumber, amount } = req.body;
  console.log(`Initiating M-Pesa payment of ${amount} for ${phoneNumber}`);
  res.json({ checkoutID: "ws_CO_0000000000000000000", message: "Success" });
});

app.post("/api/payments/callback", (req: Request, res: Response) => {
  const callbackData = req.body;
  console.log("M-Pesa Callback Received", callbackData);
  res.status(200).send("OK");
});

// --- Health Records API ---
app.get("/api/vitals/:userId", (req: Request, res: Response) => {
  res.json({ message: "Vitals fetched successfully" });
});

app.post("/api/vitals", (req: Request, res: Response) => {
  const { type, value, userId } = req.body;
  res.status(201).json({ id: "new-vital-id", status: "recorded" });
});

// --- Health Check ---
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "AfyaMkononi API",
    timestamp: new Date().toISOString(),
  });
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`AfyaMkononi Backend running on port ${PORT}`);
});
