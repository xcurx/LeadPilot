import { z } from "zod";

// ensures the LLM response matches the expected structure before entering application state.
export const leadAnalysisSchema = z.object({
  summary: z.string().min(1),
  intent: z.string().min(1),
  requirements: z.array(z.string()).min(1),
  concerns: z.array(z.string()),
  recommendedAction: z.string().min(1),
  suggestedResponse: z.string().min(1),
  intentLevel: z.enum(["high", "medium", "low"]),
  urgency: z.enum(["high", "medium", "low"]),
  budgetClarity: z.enum(["high", "medium", "low"]),
  requirementClarity: z.enum(["high", "medium", "low"]),
});

export type LeadAnalysisResponse = z.infer<typeof leadAnalysisSchema>;
