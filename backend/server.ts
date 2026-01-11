
import express from "express";
import type { Request, Response } from "express";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from "@google/genai";
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
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY
 });

app.post('/api/ai/symptoms', async (req: Request, res: Response) => {
    const { prompt, history } = req.body;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are AfyaMkononi AI. Provide healthcare guidance for Kenya. Never diagnose. Always add disclaimer."
            }
        });
        res.json({ text: response.text });
    } catch (error) {
        res.status(500).json({ error: 'AI processing failed' });
    }
});

// --- M-Pesa Integration (Daraja API) ---
app.post('/api/payments/stkpush', async (req: Request, res: Response) => {
    const { phoneNumber, amount } = req.body;
    // Implementation for Safaricom Daraja STK Push would go here
    console.log(`Initiating M-Pesa payment of ${amount} for ${phoneNumber}`);
    res.json({ checkoutID: "ws_CO_0000000000000000000", message: "Success" });
});

app.post('/api/payments/callback', (req: Request, res: Response) => {
    const callbackData = req.body;
    // Logic to update consultation status in DB based on M-Pesa result
    console.log("M-Pesa Callback Received", callbackData);
    res.status(200).send("OK");
});

// --- Health Records API ---
app.get('/api/vitals/:userId', (req: Request, res: Response) => {
    // In production, query Supabase/PostgreSQL here
    res.json({ message: "Vitals fetched successfully" });
});

app.post('/api/vitals', (req: Request, res: Response) => {
    const { type, value, userId } = req.body;
    // Logic to save to PostgreSQL
    res.status(201).json({ id: "new-vital-id", status: "recorded" });
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`AfyaMkononi Backend running on port ${PORT}`);
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "AfyaMkononi API",
    timestamp: new Date().toISOString()
  });
});

