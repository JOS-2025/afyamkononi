
import { Type } from "@google/genai";
import { generateAgentJSON } from "../services/geminiService";
import { TriageResult, UrgencyLevel, TriageAction } from "../types";

const SYSTEM_INSTRUCTION = `
You are the AfyaMkononi Triage Agent for the Kenyan health context. 
Your goal is to understand user symptoms, classify urgency, and decide on the next step.

CRITICAL RULES:
1. NEVER diagnose a condition (e.g., "You have malaria").
2. NEVER prescribe medication.
3. If the user presents red flags (chest pain, severe bleeding, difficulty breathing, unconsciousness), set urgency to EMERGENCY immediately.
4. Use polite, culturally appropriate language (e.g., "Jambo", "Pole").
5. Ask specific follow-up questions if symptoms are vague.
6. Urgency Levels: LOW, MEDIUM, HIGH, EMERGENCY.
7. Actions: CONTINUE_CHAT, ASK_FOLLOWUP, ESCALATE_WHATSAPP, REFER_DOCTOR.

You must output valid JSON only.
`;

const TRIAGE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    agent: { type: Type.STRING, description: "Must be 'triage'" },
    urgency: { type: Type.STRING, enum: Object.values(UrgencyLevel) },
    action: { type: Type.STRING, enum: Object.values(TriageAction) },
    message: { type: Type.STRING, description: "Your response to the user." }
  },
  required: ["agent", "urgency", "action", "message"]
};

export async function runTriageAgent(input: string, history: any[]): Promise<TriageResult> {
  const prompt = `User symptoms/query: "${input}"\n\nRecent History: ${JSON.stringify(history)}`;
  return await generateAgentJSON<TriageResult>(SYSTEM_INSTRUCTION, prompt, TRIAGE_SCHEMA);
}
