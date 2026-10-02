"use client";

import { useState, useEffect } from "react";
import { Lead, LeadStatus } from "@/types/lead";
import { updateLead } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Save,
} from "lucide-react";

interface FollowUpTrackerProps {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
}

const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "SITE_VISIT", label: "Site Visit" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CLOSED", label: "Closed" },
];

function formatFollowUpDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === now.toDateString()) {
    return `Today · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function FollowUpTracker({ lead, onUpdate }: FollowUpTrackerProps) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(lead.status);
    
    if (lead.followUpAt) {
      const date = new Date(lead.followUpAt);
      const tzoffset = date.getTimezoneOffset() * 60000; 
      const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
      setFollowUpDate(localISOTime);
    } else {
      setFollowUpDate("");
    }
    
    setFollowUpNote(lead.followUpNote || "");
  }, [lead]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setStatus(newStatus);
    await updateLead(lead.id, { status: newStatus });
    onUpdate({ ...lead, status: newStatus });
  };

  const handleMarkContacted = async () => {
    setStatus("CONTACTED");
    await updateLead(lead.id, { status: "CONTACTED" });
    onUpdate({ ...lead, status: "CONTACTED" });
  };

  const handleSaveFollowUp = async () => {
    setSaving(true);
    const updates: Partial<Lead> = {
      followUpNote,
      followUpAt: followUpDate ? new Date(followUpDate).toISOString() : undefined,
    };
    await updateLead(lead.id, updates);
    onUpdate({ ...lead, ...updates });
    setSaving(false);
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-400" />
          Follow-up Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current follow-up display */}
        {lead.followUpAt && (
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-400 mb-1">
              <Clock className="h-4 w-4" />
              NEXT ACTION
            </div>
            <p className="text-sm text-foreground/90 font-medium">
              📅 {formatFollowUpDate(lead.followUpAt)}
            </p>
            {lead.followUpNote && (
              <p className="text-sm text-muted-foreground mt-1">
                {lead.followUpNote}
              </p>
            )}
            {lead.status === "NEW" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 cursor-pointer"
                onClick={handleMarkContacted}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Contacted
              </Button>
            )}
          </div>
        )}

        <Separator className="bg-border/30" />

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Status
          </Label>
          <Select value={status} onValueChange={(v) => handleStatusChange(v as LeadStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Follow-up scheduling */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Follow-up Date & Time
          </Label>
          <Input
            type="datetime-local"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            style={{ colorScheme: "dark" }}
            className="block w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Note
          </Label>
          <Textarea
            value={followUpNote}
            onChange={(e) => setFollowUpNote(e.target.value)}
            placeholder="e.g. Send 2BHK options near metro under ₹70L"
            rows={2}
            className="resize-none text-sm"
          />
        </div>

        <Button
          onClick={handleSaveFollowUp}
          disabled={saving}
          className="w-full cursor-pointer"
          size="sm"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Follow-up"}
        </Button>
      </CardContent>
    </Card>
  );
}
