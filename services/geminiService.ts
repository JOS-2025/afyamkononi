import { ChatMessage, VitalsRecord } from "../types";

/**
 * Base URL for the backend (Railway)
 * This MUST be set in Vercel as VITE_API_BASE_URL
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Generic helper to call the AfyaMkononi backend AI proxy.
 * All AI logic and API keys live on the server.
 */
async function callAiBackend(endpoint: string, payload: any): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Backend AI request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("Error communicating with AfyaMkononi Backend:", error);
    throw error;
  }
}

/**
 * Chat / symptom analysis (frontend-safe).
 * Streaming is simulated by returning the full text at once.
 */
export const getGeminiChatResponseStream = async (
  history: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<{
  fullText: string;
  isEmergency: boolean;
  links: { title: string; uri: string }[];
}> => {
  try {
    const fullText = await callAiBackend("/api/ai/symptoms", {
      prompt: newMessage,
      history: history.map(m => ({
        role: m.role,
        text: m.text
      }))
    });

    // Send text back to UI
    onChunk(fullText);

    // Simple emergency keyword detection
    const upper = fullText.toUpperCase();
    const isEmergency =
      upper.includes("EMERGENCY") ||
      upper.includes("IMMEDIATELY") ||
      upper.includes("DANGER");

    return {
      fullText,
      isEmergency,
      links: []
    };
  } catch {
    const errorMsg =
      "Samahani, I encountered an error. Please check your connection.";
    onChunk(errorMsg);

    return {
      fullText: errorMsg,
      isEmergency: false,
      links: []
    };
  }
};

/**
 * Analyze vitals via backend AI
 */
export const analyzeVitals = async (
  vitals: VitalsRecord[]
): Promise<string> => {
  const vitalsText = vitals
    .map(v => `${v.type}: ${v.value}${v.unit}`)
    .join(", ");

  try {
    return await callAiBackend("/api/ai/symptoms", {
      prompt: `User vitals data: ${vitalsText}. Provide a short, encouraging health insight for a Kenyan user.`
    });
  } catch {
    return "Your vitals show important trends. Afya kwanza!";
  }
};

/**
 * Generate a simplified medical summary
 */
export const generateMedicalSummary = async (
  doctorNotes: string
): Promise<string> => {
  try {
    return await callAiBackend("/api/ai/symptoms", {
      prompt: `Simplify these doctor notes for a patient in clear, simple language: "${doctorNotes}"`
    });
  } catch {
    return "Unable to simplify medical notes at this time.";
  }
};

/**
 * Daily health insight
 */
export const generateDailyHealthInsight = async (
  userName: string
): Promise<string> => {
  try {
    return await callAiBackend("/api/ai/symptoms", {
      prompt: `Generate a short daily health tip for ${userName} in Kenya (max 20 words).`
    });
  } catch {
    return "Drink plenty of water and stay active today!";
  }
};

/**
 * Generate article tip
 */
export const generateArticleTip = async (
  title: string,
  content: string
): Promise<string> => {
  try {
    return await callAiBackend("/api/ai/symptoms", {
      prompt: `Article title: ${title}. Content preview: ${content.slice(
        0,
        200
      )}. Provide one helpful health takeaway.`
    });
  } catch {
    return "Stay informed for better health decisions.";
  }
};
