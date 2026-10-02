"use client";

import { useState, useEffect, useRef } from "react";
import { Lead } from "@/types/lead";
import { ChatMessage as ChatMessageType, Conversation } from "@/types/chat";
import { getConversation, saveConversation } from "@/lib/db";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";

interface CopilotProps {
  lead: Lead;
}

const QUICK_PROMPTS = [
  "What should I emphasize on the call?",
  "What concerns does this customer have?",
  "What information is still missing?",
];

export default function Copilot({ lead }: CopilotProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadConversation = async () => {
      const conv = await getConversation(lead.id);
      if (conv) {
        setMessages(conv.messages);
      } else {
        setMessages([]);
      }
    };
    loadConversation();
  }, [lead.id]);

  // auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const persistConversation = async (msgs: ChatMessageType[]) => {
    const conv = await getConversation(lead.id);
    const now = new Date().toISOString();
    const updated: Conversation = conv
      ? { ...conv, messages: msgs, updatedAt: now }
      : {
          id: uuidv4(),
          leadId: lead.id,
          messages: msgs,
          createdAt: now,
          updatedAt: now,
        };
    await saveConversation(updated);
  };

  const handleSend = async (content: string) => {
    setError(null);
    const userMessage: ChatMessageType = {
      id: uuidv4(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            name: lead.name,
            location: lead.location,
            propertyRequirement: lead.propertyRequirement,
            budget: lead.budget,
            buyingTimeline: lead.buyingTimeline,
            customerMessage: lead.customerMessage,
          },
          analysis: lead.analysis,
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: ChatMessageType = {
        id: uuidv4(),
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      await persistConversation(finalMessages);
    } catch {
      setError("Failed to generate response. Please try again.");
      await persistConversation(newMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`border-border bg-card shadow-sm flex flex-col transition-all duration-200 ${isExpanded ? "h-[650px]" : "h-[400px]"}`}>
      <CardHeader className="pb-2 shrink-0 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          AI Copilot
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-6">
            <Sparkles className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground text-center mb-4">
              Ask contextual questions about this lead
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={loading} />
    </Card>
  );
}
