import { NextRequest, NextResponse } from "next/server";
import { createNvidiaProvider } from "@/lib/ai/nvidia";
import { z } from "zod";

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  createdAt: z.string(),
});

const requestSchema = z.object({
  lead: z.object({
    name: z.string(),
    location: z.string(),
    propertyRequirement: z.string(),
    budget: z.string(),
    buyingTimeline: z.string(),
    customerMessage: z.string(),
  }),
  analysis: z
    .object({
      summary: z.string(),
      intent: z.string(),
      requirements: z.array(z.string()),
      concerns: z.array(z.string()),
      recommendedAction: z.string(),
      suggestedResponse: z.string(),
      intentLevel: z.enum(["high", "medium", "low"]),
      urgency: z.enum(["high", "medium", "low"]),
      budgetClarity: z.enum(["high", "medium", "low"]),
      requirementClarity: z.enum(["high", "medium", "low"]),
    })
    .optional(),
  messages: z.array(messageSchema).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { lead, analysis, messages } = parsed.data;

    const provider = createNvidiaProvider();
    const reply = await provider.chat(lead, analysis, messages);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: "Failed to generate response", details: message },
      { status: 500 }
    );
  }
}
