import { classifyIntent } from "./services/geminiService";
import { runTriageAgent } from "./agents/triageAgent.js";
import { runCareAgent } from "./agents/careAgent.js";
import { runEscalationAgent } from "./agents/escalationAgent.js";
import { runMemoryAgent } from "./agents/memoryAgent.js";
import { 
  BackendResponse, 
  UrgencyLevel, 
  TriageAction, 
  EscalationChannel 
} from "./types";

const WHATSAPP_NUMBER = "254700000000"; // Mock Kenyan support number
const WHATSAPP_BASE_URL = "https://wa.me/";

export async function agentOrchestrator(
  input: string,
  userId: string,
  history: any[]
): Promise<BackendResponse> {
  try {
    // 1. Classify Intent
    const intent = await classifyIntent(input, history);
    console.log(`[Orchestrator] Intent: ${intent}`);

    let finalResponse: BackendResponse;

    // 2. Route to specialized Agent
    if (intent === 'TRIAGE') {
      const triage = await runTriageAgent(input, history);
      
      if (triage.urgency === UrgencyLevel.EMERGENCY) {
        finalResponse = { 
          type: 'emergency', 
          message: "🚨 THIS IS AN EMERGENCY. Please call 112 or visit the nearest hospital (like KNH or Avenue Hospital) immediately." 
        };
      } else if (triage.action === TriageAction.ESCALATE_WHATSAPP || triage.action === TriageAction.REFER_DOCTOR) {
        const escalation = await runEscalationAgent(input, `Triage result: ${triage.urgency} urgency, ${triage.message}`);
        const encodedMsg = encodeURIComponent(`Jambo AfyaMkononi, I need help with my health. Reason: ${triage.message}`);
        finalResponse = {
          type: 'redirect',
          target: 'whatsapp',
          url: `${WHATSAPP_BASE_URL}${WHATSAPP_NUMBER}?text=${encodedMsg}`
        };
      } else {
        finalResponse = { type: 'chat', message: triage.message };
      }
    } 
    else if (intent === 'CARE') {
      const care = await runCareAgent(input);
      finalResponse = { 
        type: 'chat', 
        message: care.message, 
        disclaimer: care.disclaimer 
      };
    } 
    else {
      // ESCALATION Intent
      const escalation = await runEscalationAgent(input, "User requested human help directly.");
      if (escalation.channel === EscalationChannel.EMERGENCY) {
         finalResponse = { type: 'emergency', message: "Please call 112 immediately." };
      } else {
         const encodedMsg = encodeURIComponent("Jambo AfyaMkononi, I need to speak with a health assistant.");
         finalResponse = {
           type: 'redirect',
           target: 'whatsapp',
           url: `${WHATSAPP_BASE_URL}${WHATSAPP_NUMBER}?text=${encodedMsg}`
         };
      }
    }

    // 3. Update Memory (Async, don't block response)
    runMemoryAgent(userId, { input, response: finalResponse, timestamp: new Date().toISOString() });

    return finalResponse;

  } catch (error) {
    console.error("[Orchestrator Error]", error);
    return { 
      type: 'chat', 
      message: "Pole sana, I am having trouble processing that right now. Please try again or visit your nearest clinic if you feel unwell." 
    };
  }
}
