import { NextRequest, NextResponse } from "next/server";
import { createNvidiaProvider } from "@/lib/ai/nvidia";
import { z } from "zod";

const requestSchema = z.object({
  lead: z.object({
    name: z.string(),
    location: z.string(),
    propertyRequirement: z.string(),
    budget: z.string(),
    buyingTimeline: z.string(),
    customerMessage: z.string(),
  }),
  currentResponse: z.string().min(1, "Current response is required"),
  prompt: z.string().min(1, "Refinement prompt is required"),
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

    const { lead, currentResponse, prompt } = parsed.data;

    const provider = createNvidiaProvider();
    const refinedResponse = await provider.refineResponse(lead, currentResponse, prompt);

    return NextResponse.json({ response: refinedResponse });
  } catch (error) {
    console.error("Refine response API error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: "Failed to refine response", details: message },
      { status: 500 }
    );
  }
}
