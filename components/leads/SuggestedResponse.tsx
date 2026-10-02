"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquareQuote, Copy, Check, Wand2, Loader2, X } from "lucide-react";
import { Lead } from "@/types/lead";
import { updateLead } from "@/lib/db";

interface SuggestedResponseProps {
  response: string;
  lead: Lead;
  onUpdateResponse?: (newResponse: string) => void;
}

export default function SuggestedResponse({ response, lead, onUpdateResponse }: SuggestedResponseProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(response);

  // sync state if prop changes from external
  useEffect(() => {
    setCurrentResponse(response);
    setIsEditing(false);
    setEditPrompt("");
  }, [response]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = currentResponse;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefine = async () => {
    if (!editPrompt.trim()) return;
    setIsRefining(true);
    try {
      const res = await fetch("/api/refine-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead,
          currentResponse,
          prompt: editPrompt
        })
      });

      if (!res.ok) throw new Error("Failed to refine response");

      const data = await res.json();
      setCurrentResponse(data.response);
      
      // update database using onUpdateResponse callback
      if (onUpdateResponse) {
        onUpdateResponse(data.response);
        // also persist directly to db to be safe
        await updateLead(lead.id, {
          analysis: {
            ...lead.analysis!,
            suggestedResponse: data.response
          }
        });
      }
      
      setIsEditing(false);
      setEditPrompt("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquareQuote className="h-4 w-4 text-blue-400" />
            Suggested Response
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs h-8 cursor-pointer"
              disabled={isRefining}
            >
              <Wand2 className="h-3.5 w-3.5 mr-1.5" />
              Refine
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-xs h-8 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy Response
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-accent border border-border/50 rounded-xl p-5">
          <p className="text-sm text-foreground/90 leading-relaxed font-medium">
            {currentResponse}
          </p>
        </div>

        {isEditing && (
          <div className="flex gap-2 items-center bg-background p-3 rounded-lg border border-border/50">
            <Input
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="E.g., Make it shorter and more professional..."
              className="flex-1 text-sm bg-transparent border-none shadow-none focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleRefine();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleRefine}
              disabled={isRefining || !editPrompt.trim()}
              className="cursor-pointer shrink-0"
            >
              {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="cursor-pointer shrink-0 px-2"
              disabled={isRefining}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
