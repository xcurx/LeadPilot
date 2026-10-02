import { Lead, LeadAnalysis } from "@/types/lead";
import { createLead, getLeadCount } from "@/lib/db";
import { calculatePriorityScore, getPriorityLabel } from "@/lib/scoring";
import { v4 as uuidv4 } from "uuid";

interface SeedLead {
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  customerMessage: string;
  analysis: LeadAnalysis;
}

const SEED_LEADS: SeedLead[] = [
  {
    name: "Rahul Sharma",
    location: "Nagpur",
    propertyRequirement: "2BHK apartment",
    budget: "₹70L",
    buyingTimeline: "3 months",
    customerMessage:
      "Looking for a 2BHK in Nagpur, preferably near metro connectivity. Budget is around 70 lakhs. We want to finalize within 3 months. I'm concerned about maintenance charges.",
    analysis: {
      summary:
        "Serious buyer looking for a 2BHK apartment near metro in Nagpur with a clear budget of ₹70L and a 3-month buying timeline. Has specific concerns about maintenance charges.",
      intent: "High purchase intent — wants to finalize within 3 months with a clear budget and specific requirements.",
      requirements: [
        "2BHK apartment",
        "Metro connectivity",
        "Budget around ₹70 lakhs",
        "Finalize within 3 months",
      ],
      concerns: [
        "Maintenance charges",
        "Value for money on recurring costs",
      ],
      recommendedAction:
        "Share 2-3 curated 2BHK options near metro with transparent maintenance charge breakdowns. Emphasize properties with reasonable society maintenance.",
      suggestedResponse:
        "Hi Rahul, based on your requirement for a 2BHK around ₹70L with good metro connectivity, I have shortlisted a few properties that fit your criteria. I've also included the maintenance charge details for each — I know that's important to you. Would you like to schedule a site visit this week?",
      intentLevel: "high",
      urgency: "high",
      budgetClarity: "high",
      requirementClarity: "medium",
    },
  },
  {
    name: "Priya Mehta",
    location: "Mumbai, Andheri West",
    propertyRequirement: "3BHK apartment",
    budget: "₹1.5 Cr",
    buyingTimeline: "2 months",
    customerMessage:
      "We're a family of four, looking to upgrade from our current 2BHK. Want a 3BHK in Andheri West, close to schools and the metro. Budget is up to 1.5 crore. We need to move before the new school session starts. Please share options with good amenities.",
    analysis: {
      summary:
        "Motivated family looking to upgrade to 3BHK in Andheri West, Mumbai. Has a tight 2-month deadline tied to school session. Budget is clear at ₹1.5 Cr.",
      intent: "Very high intent — upgrading current home with a hard deadline tied to school session.",
      requirements: [
        "3BHK apartment",
        "Andheri West locality",
        "Proximity to schools and metro",
        "Good amenities (swimming pool, gym, etc.)",
        "Move-in ready within 2 months",
      ],
      concerns: [
        "Tight timeline — needs to move before school session",
        "Quality of amenities for family living",
      ],
      recommendedAction:
        "Prioritize ready-to-move 3BHK options in Andheri West near schools. Highlight amenities and schedule urgent site visits.",
      suggestedResponse:
        "Hi Priya, I completely understand the urgency with the school session approaching. I've identified 3 ready-to-move 3BHK properties in Andheri West within your budget — all close to reputed schools and the metro. Shall we start with site visits this weekend?",
      intentLevel: "high",
      urgency: "high",
      budgetClarity: "high",
      requirementClarity: "high",
    },
  },
  {
    name: "Amit Verma",
    location: "Pune, Hinjewadi",
    propertyRequirement: "2BHK or 3BHK",
    budget: "₹50-80L",
    buyingTimeline: "6 months",
    customerMessage:
      "I work in IT and might shift to Hinjewadi. Exploring options for 2BHK or 3BHK apartments. Budget is flexible between 50 to 80 lakhs. No immediate rush, maybe within 6 months. Interested in properties with good resale value.",
    analysis: {
      summary:
        "IT professional exploring buying options in Hinjewadi, Pune. Not committed to the location yet — still considering the shift. Budget is broad (₹50-80L) and timeline is relaxed.",
      intent: "Medium intent — still exploring and hasn't committed to the move.",
      requirements: [
        "2BHK or 3BHK (undecided)",
        "Hinjewadi area",
        "Good resale value",
        "Budget ₹50-80 lakhs (flexible)",
      ],
      concerns: [
        "Uncertain about the relocation itself",
        "Resale value is a key decision factor",
      ],
      recommendedAction:
        "Nurture this lead with market insights about Hinjewadi's real estate appreciation. Don't push for immediate visits — share data-driven content.",
      suggestedResponse:
        "Hi Amit, great choice considering Hinjewadi — the area has seen strong appreciation lately. I'll share a few options in both 2BHK and 3BHK with their projected resale trends. No pressure, we can move at your pace. Would you like me to send a comparison report?",
      intentLevel: "medium",
      urgency: "medium",
      budgetClarity: "medium",
      requirementClarity: "medium",
    },
  },
  {
    name: "Riya Kapoor",
    location: "Delhi NCR",
    propertyRequirement: "Residential plot",
    budget: "Not decided",
    buyingTimeline: "1 year",
    customerMessage:
      "Just doing some research on residential plots in Delhi NCR region. Haven't decided the budget yet. Maybe within a year or so. Can you tell me what's available?",
    analysis: {
      summary:
        "Early-stage researcher exploring residential plots in Delhi NCR. No budget decided, 1-year timeline. Minimal urgency and vague requirements.",
      intent: "Low intent — purely in the research phase without concrete plans.",
      requirements: [
        "Residential plot",
        "Delhi NCR region (no specific area)",
      ],
      concerns: [
        "No clear budget — likely unsure about investment capacity",
        "Very early in the decision-making process",
      ],
      recommendedAction:
        "Add to a long-term nurture list. Send periodic market updates about Delhi NCR plots. Check back in 2-3 months.",
      suggestedResponse:
        "Hi Riya, thanks for reaching out! Delhi NCR has some interesting plot options across various price ranges. I'll put together a brief overview of the current market with some options to help you get started with your research. I'll stay in touch with updates!",
      intentLevel: "low",
      urgency: "low",
      budgetClarity: "low",
      requirementClarity: "low",
    },
  },
];

// seed the database with demo leads if it's empty.
// only inserts when no leads exist.
export async function seedDatabase(): Promise<void> {
  const count = await getLeadCount();
  if (count > 0) return;

  const now = new Date().toISOString();

  for (const seed of SEED_LEADS) {
    const score = calculatePriorityScore(seed.analysis);
    const label = getPriorityLabel(score);

    const lead: Lead = {
      id: uuidv4(),
      name: seed.name,
      location: seed.location,
      propertyRequirement: seed.propertyRequirement,
      budget: seed.budget,
      buyingTimeline: seed.buyingTimeline,
      customerMessage: seed.customerMessage,
      analysis: seed.analysis,
      priorityScore: score,
      priorityLabel: label,
      status: "New",
      followUps: [],
      createdAt: now,
      updatedAt: now,
    };

    await createLead(lead);
  }
}
