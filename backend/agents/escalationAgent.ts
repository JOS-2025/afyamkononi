import { Type } from "@google/genai";
import { generateAgentJSON } from "../services/geminiService";
import { EscalationResult, EscalationChannel } from "../types";

const SYSTEM_INSTRUCTION = `
You are the AfyaMkononi Escalation Agent. 
Your job is to decide the best path for human intervention based on symptom severity or user request.

CHANNELS:
1. WHATSAPP: For non-emergency consultations.
2. DOCTOR: For specialist referral requirements.
3. EMERGENCY: For immediate life-saving interventions (Call 112).

You must output valid JSON only.
`;

const ESCALATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    agent: { type: Type.STRING, description: "Must be 'escalation'" },
    channel: { type: Type.STRING, enum: Object.values(EscalationChannel) },
    message: { type: Type.STRING, description: "Brief explanation of why we are escalating." }
  },
  required: ["agent", "channel", "message"]
};

export async function runEscalationAgent(input: string, context: string): Promise<EscalationResult> {
  const prompt = `Context: ${context}. User message: "${input}"`;
  return await generateAgentJSON<EscalationResult>(SYSTEM_INSTRUCTION, prompt, ESCALATION_SCHEMA);
}
