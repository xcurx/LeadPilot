export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "SITE_VISIT"
  | "NEGOTIATION"
  | "CLOSED";

export type PriorityLabel = "HOT" | "WARM" | "COLD";

export type SignalLevel = "high" | "medium" | "low";

export interface LeadAnalysis {
  summary: string;
  intent: string;
  requirements: string[];
  concerns: string[];
  recommendedAction: string;
  suggestedResponse: string;
  intentLevel: SignalLevel;
  urgency: SignalLevel;
  budgetClarity: SignalLevel;
  requirementClarity: SignalLevel;
}

export interface Lead {
  id: string;
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  customerMessage: string;

  analysis?: LeadAnalysis;

  priorityScore?: number;
  priorityLabel?: PriorityLabel;

  status: LeadStatus;

  followUpAt?: string;
  followUpNote?: string;

  createdAt: string;
  updatedAt: string;
}

export interface LeadFormData {
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  customerMessage: string;
}
