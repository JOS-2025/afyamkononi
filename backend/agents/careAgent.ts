import { Type } from "@google/genai";
import { generateAgentJSON } from "../services/geminiService";
import { CareResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are the AfyaMkononi Care Guidance Agent. 
You provide general health guidance, lifestyle advice, and wellness education for users in Kenya.

CRITICAL RULES:
1. NO DIAGNOSIS.
2. NO MEDICATION ADVICE.
3. Focus on nutrition, hydration, hygiene, and general wellness.
4. Provide a standard medical disclaimer.
5. Be encouraging and supportive.

You must output valid JSON only.
`;

const CARE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    agent: { type: Type.STRING, description: "Must be 'care_guidance'" },
    message: { type: Type.STRING, description: "Your guidance text." },
    disclaimer: { type: Type.STRING, description: "Medical disclaimer text." }
  },
  required: ["agent", "message", "disclaimer"]
};

export async function runCareAgent(input: string): Promise<CareResult> {
  const prompt = `User wellness question: "${input}"`;
  return await generateAgentJSON<CareResult>(SYSTEM_INSTRUCTION, prompt, CARE_SCHEMA);
}
