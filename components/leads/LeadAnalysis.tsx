"use client";

import { LeadAnalysis as LeadAnalysisType } from "@/types/lead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Target,
  AlertTriangle,
  Lightbulb,
  ClipboardList,
  Sparkles,
} from "lucide-react";

interface LeadAnalysisProps {
  analysis: LeadAnalysisType;
}

const LEVEL_STYLES: Record<string, { text: string; dot: string }> = {
  high: { text: "text-red-600", dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" },
  medium: { text: "text-amber-600", dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" },
  low: { text: "text-emerald-600", dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" },
};

export default function LeadAnalysis({ analysis }: LeadAnalysisProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        <Separator className="bg-border/30" />

        {/* Signal levels */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Intent", value: analysis.intentLevel },
            { label: "Urgency", value: analysis.urgency },
            { label: "Budget Clarity", value: analysis.budgetClarity },
            { label: "Req. Clarity", value: analysis.requirementClarity },
          ].map((signal) => (
            <div
              key={signal.label}
              className="flex flex-col gap-1.5 p-3 rounded-xl border border-border/60 bg-white shadow-sm"
            >
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {signal.label}
              </span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${LEVEL_STYLES[signal.value].dot}`} />
                <span className={`text-xs font-bold ${LEVEL_STYLES[signal.value].text}`}>
                  {signal.value.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-border/30" />

        {/* Intent */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-medium">Customer Intent</h4>
          </div>
          <p className="text-sm text-muted-foreground pl-6">
            {analysis.intent}
          </p>
        </div>

        {/* Requirements */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="h-4 w-4 text-violet-400" />
            <h4 className="text-sm font-medium">Key Requirements</h4>
          </div>
          <ul className="space-y-1 pl-6">
            {analysis.requirements.map((req, i) => (
              <li
                key={i}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span className="text-primary mt-1.5 shrink-0">•</span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Concerns */}
        {analysis.concerns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h4 className="text-sm font-medium">Concerns / Objections</h4>
            </div>
            <ul className="space-y-1 pl-6">
              {analysis.concerns.map((concern, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-amber-400 mt-1.5 shrink-0">•</span>
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Action */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-medium">Recommended Action</h4>
          </div>
          <p className="text-sm text-muted-foreground pl-6 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
            {analysis.recommendedAction}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
