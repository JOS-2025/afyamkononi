
import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { ChatMessage, VitalsRecord } from "../types";

const SYSTEM_PROMPT = `
You are AfyaMkononi AI, a specialized healthcare assistant for the Kenyan and African context.

ROLE & LIMITS:
- You provide symptom guidance, health education, and first-aid advice.
- You NEVER diagnose. You NEVER prescribe medication.
- You MUST append a disclaimer at the end of every response: "Disclaimer: This is AI guidance, not a medical diagnosis. In emergencies, visit the nearest hospital or call 999/112."
- For emergency symptoms, escalate IMMEDIATELY.

KENYAN CONTEXT:
- Suggest seeking the nearest Level 4 or Level 5 facility. Use Google Maps to find specific hospitals if the user asks.
- Reference local health context: Malaria, Cholera, Linda Mama.

TOOLS:
- You have access to Google Maps to find real hospitals and pharmacies in Kenya.
`;

export const getGeminiChatResponseStream = async (
  history: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<{ fullText: string; isEmergency: boolean; links: { title: string; uri: string }[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents: Content[] = [
    ...history.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
    { role: 'user', parts: [{ text: newMessage }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Use 2.5 flash for Maps tool support
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleMaps: {} }],
        temperature: 0.5,
      }
    });

    const fullText = response.text || "";
    onChunk(fullText);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = groundingChunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        title: chunk.maps.title,
        uri: chunk.maps.uri
      }));

    const isEmergency = fullText.includes("EMERGENCY DETECTED");
    return { fullText, isEmergency, links };
  } catch (error) {
    console.error("Gemini Error:", error);
    const errorMsg = "Samahani, I encountered an error. Please check your connection.";
    onChunk(errorMsg);
    return { fullText: errorMsg, isEmergency: false, links: [] };
  }
};

export const analyzeVitals = async (vitals: VitalsRecord[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dataString = vitals.map(v => `${v.type}: ${v.value}${v.unit} (${v.timestamp.toLocaleDateString()})`).join(', ');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Vitals Data: ${dataString}. Provide a short, 20-word encouraging insight about these health trends for a Kenyan user.`,
    });
    return response.text || "Keep monitoring your vitals. Afya ni mali!";
  } catch {
    return "Your vitals show important trends. Maintain your routine!";
  }
};

export const generateMedicalSummary = async (doctorNotes: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Doctor's Notes: "${doctorNotes}"`,
      config: {
        systemInstruction: `You are AfyaMkononi AI assistant. Simplify medical notes for a Kenyan patient. Max 100 words. Format with Findings and Next Steps.`
      }
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    return "Unable to simplify notes at this time.";
  }
};

export const generateDailyHealthInsight = async (userName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a 25-word daily health insight for ${userName} in Kenya. Include one local Swahili word.`,
    });
    return response.text || "Stay hydrated today!";
  } catch {
    return "Drink water and stay safe. Afya kwanza!";
  }
};

export const generateArticleTip = async (title: string, content: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Title: ${title}. Content: ${content.substring(0, 300)}. Catchy pro-tip with emoji.`,
    });
    return response.text || "Health is wealth.";
  } catch {
    return "Prioritize health.";
  }
};
