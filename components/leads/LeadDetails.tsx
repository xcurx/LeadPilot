"use client";

import { Lead } from "@/types/lead";
import PriorityBadge from "@/components/dashboard/PriorityBadge";
import LeadAnalysisComponent from "./LeadAnalysis";
import SuggestedResponse from "./SuggestedResponse";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Home,
  Wallet,
  Clock,
  MessageSquare,
  RefreshCw,
  Loader2,
  Trash2,
} from "lucide-react";

interface LeadDetailsProps {
  lead: Lead;
  onRetryAnalysis: () => void;
  onDelete: () => void;
  isAnalyzing: boolean;
  onUpdate?: (updatedLead: Lead) => void;
  onScheduleFollowUp?: (note: string) => void;
}

export default function LeadDetails({
  lead,
  onRetryAnalysis,
  onDelete,
  isAnalyzing,
  onUpdate,
  onScheduleFollowUp,
}: LeadDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Lead header */}
      <div>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">{lead.name}</h2>
            {lead.priorityLabel && lead.priorityScore !== undefined && (
              <PriorityBadge
                label={lead.priorityLabel}
                score={lead.priorityScore}
                size="md"
              />
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="bg-primary text-primary-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer border-border shadow-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Lead
          </Button>
        </div>

        {/* Quick info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
          <div className="flex flex-col gap-1 p-4 bg-card border border-border shadow-sm rounded-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Location
            </div>
            <span className="text-sm font-semibold text-foreground truncate">{lead.location}</span>
          </div>
          <div className="flex flex-col gap-1 p-4 bg-card border border-border shadow-sm rounded-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Home className="h-3.5 w-3.5 text-primary" />
              Property
            </div>
            <span className="text-sm font-semibold text-foreground truncate">{lead.propertyRequirement}</span>
          </div>
          <div className="flex flex-col gap-1 p-4 bg-card border border-border shadow-sm rounded-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Wallet className="h-3.5 w-3.5 text-primary" />
              Budget
            </div>
            <span className="text-sm font-semibold text-foreground">{lead.budget}</span>
          </div>
          <div className="flex flex-col gap-1 p-4 bg-card border border-border shadow-sm rounded-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Timeline
            </div>
            <span className="text-sm font-semibold text-foreground">{lead.buyingTimeline}</span>
          </div>
        </div>

        {/* Customer message */}
        <div className="mt-6 bg-card border border-border shadow-sm rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/60"></div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Message from {lead.name.split(' ')[0]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            "{lead.customerMessage}"
          </p>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Analysis */}
      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p className="text-sm">Analyzing lead...</p>
        </div>
      ) : lead.analysis ? (
        <>
          <LeadAnalysisComponent 
            analysis={lead.analysis} 
            onScheduleFollowUp={onScheduleFollowUp}
          />
          <SuggestedResponse 
            response={lead.analysis.suggestedResponse} 
            lead={lead}
            onUpdateResponse={onUpdate ? (newResp) => {
              if (lead.analysis) {
                onUpdate({
                  ...lead,
                  analysis: {
                    ...lead.analysis,
                    suggestedResponse: newResp
                  }
                });
              }
            } : undefined}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-sm mb-3">AI analysis unavailable.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetryAnalysis}
            className="cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Analysis
          </Button>
        </div>
      )}
    </div>
  );
}
