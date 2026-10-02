import { LeadFormData, LeadAnalysis } from "@/types/lead";
import { ChatMessage } from "@/types/chat";

export interface AIProvider {
  analyzeLead(lead: LeadFormData): Promise<LeadAnalysis>;
  chat(
    lead: LeadFormData,
    analysis: LeadAnalysis | undefined,
    messages: ChatMessage[]
  ): Promise<string>;
}
