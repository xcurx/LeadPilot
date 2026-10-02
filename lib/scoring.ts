import { SignalLevel, LeadAnalysis, PriorityLabel } from "@/types/lead";

const LEVEL_SCORES: Record<SignalLevel, number> = {
  high: 100,
  medium: 60,
  low: 20,
};

const WEIGHTS = {
  intent: 0.35,
  urgency: 0.30,
  budget: 0.15,
  requirements: 0.20,
} as const;

const THRESHOLDS = {
  hot: 80,
  warm: 50,
} as const;

// calculate a deterministic priority score from AI-extracted semantic signals.
// score = intent × 0.35 + urgency × 0.30 + budget × 0.15 + requirements × 0.20
export function calculatePriorityScore(analysis: LeadAnalysis): number {
  const raw =
    LEVEL_SCORES[analysis.intentLevel] * WEIGHTS.intent +
    LEVEL_SCORES[analysis.urgency] * WEIGHTS.urgency +
    LEVEL_SCORES[analysis.budgetClarity] * WEIGHTS.budget +
    LEVEL_SCORES[analysis.requirementClarity] * WEIGHTS.requirements;

  return Math.round(raw);
}

export function getPriorityLabel(score: number): PriorityLabel {
  if (score >= THRESHOLDS.hot) return "HOT";
  if (score >= THRESHOLDS.warm) return "WARM";
  return "COLD";
}

export function getPriorityEmoji(label: PriorityLabel): string {
  switch (label) {
    case "HOT":
      return "🔥";
    case "WARM":
      return "🟡";
    case "COLD":
      return "🟢";
  }
}
