export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Site Visit"
  | "Negotiation"
  | "Closed";

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

export type FollowUpType = "Call" | "Email" | "Site Visit" | "Meeting" | "Other";

export interface FollowUpEntry {
  id: string;
  type: FollowUpType;
  note: string;
  scheduledAt: string;
  completedAt?: string;
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

  followUps?: FollowUpEntry[];

  // deprecated — kept for backward compat with existing DB entries
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
