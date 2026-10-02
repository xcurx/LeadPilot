import { NextRequest, NextResponse } from "next/server";
import { createNvidiaProvider } from "@/lib/ai/nvidia";
import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  propertyRequirement: z.string().min(1),
  budget: z.string().min(1),
  buyingTimeline: z.string().min(1),
  customerMessage: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // validate request
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const provider = createNvidiaProvider();
    const analysis = await provider.analyzeLead(parsed.data);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analysis API error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: "Failed to analyze lead", details: message },
      { status: 500 }
    );
  }
}
