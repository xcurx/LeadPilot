import { AIProvider } from "./client";
import { LeadFormData, LeadAnalysis } from "@/types/lead";
import { ChatMessage } from "@/types/chat";
import { buildAnalysisPrompt, buildChatSystemPrompt, buildRefinePrompt, formatMessagesForAPI } from "./prompts";
import { leadAnalysisSchema } from "./schemas";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export class NvidiaProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyzeLead(lead: LeadFormData): Promise<LeadAnalysis> {
    const prompt = buildAnalysisPrompt(lead);

    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a real-estate sales analysis AI. You MUST respond with valid JSON only. No markdown, no code fences, no explanation text.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `NVIDIA API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("No content in NVIDIA API response");
    }

    // clean response, strip markdown code fences if model wraps JSON
    const cleaned = rawContent
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${cleaned.substring(0, 200)}`);
    }

    // validate with Zod
    const validated = leadAnalysisSchema.parse(parsed);
    return validated;
  }

  async chat(
    lead: LeadFormData,
    analysis: LeadAnalysis | undefined,
    messages: ChatMessage[]
  ): Promise<string> {
    const systemPrompt = buildChatSystemPrompt(lead, analysis);
    const formattedMessages = formatMessagesForAPI(systemPrompt, messages);

    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: formattedMessages,
        temperature: 0.5,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `NVIDIA API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in NVIDIA chat response");
    }

    return content.trim();
  }

  async refineResponse(
    lead: LeadFormData,
    currentResponse: string,
    prompt: string
  ): Promise<string> {
    const systemPrompt = buildRefinePrompt(lead, currentResponse);

    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Instruction to refine the response: ${prompt}` },
        ],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `NVIDIA API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in NVIDIA API response");
    }

    // clean up potential markdown formatting that the LLM might add
    return content.replace(/^"|"$/g, "").trim();
  }
}

// create the nvidia provider from environment variables
// this is called server-side only
export function createNvidiaProvider(): NvidiaProvider {
  const apiKey = process.env.NVIDIA_API_KEY;
  const model = process.env.NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b";

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY environment variable is not set");
  }

  return new NvidiaProvider(apiKey, model);
}
