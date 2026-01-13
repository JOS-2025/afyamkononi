import { supabaseMock } from "../services/supabaseService";
import { MemoryResult } from "../types";

export async function runMemoryAgent(userId: string, interaction: any): Promise<MemoryResult> {
  try {
    const result = await supabaseMock.saveConsultation(userId, interaction);
    return {
      agent: 'memory',
      stored: result.success,
      consultation_id: result.id
    };
  } catch (error) {
    return {
      agent: 'memory',
      stored: false,
      consultation_id: ''
    };
  }
}
