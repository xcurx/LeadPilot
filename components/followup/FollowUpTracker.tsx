"use client";

import { useState, useEffect } from "react";
import { Lead, FollowUpEntry, FollowUpType } from "@/types/lead";
import { updateLead } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Phone,
  Mail,
  MapPin,
  Users,
  MoreHorizontal,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface FollowUpTrackerProps {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
  preFillNote?: string;
  onClearPreFill?: () => void;
}

const FOLLOW_UP_TYPES: { value: FollowUpType; icon: typeof Phone }[] = [
  { value: "Call", icon: Phone },
  { value: "Email", icon: Mail },
  { value: "Site Visit", icon: MapPin },
  { value: "Meeting", icon: Users },
  { value: "Other", icon: MoreHorizontal },
];

function formatDate(dateStr: string): string {
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

function getTypeIcon(type: FollowUpType) {
  const match = FOLLOW_UP_TYPES.find((t) => t.value === type);
  return match?.icon ?? MoreHorizontal;
}

export default function FollowUpTracker({ lead, onUpdate, preFillNote, onClearPreFill }: FollowUpTrackerProps) {
  const [followUps, setFollowUps] = useState<FollowUpEntry[]>(lead.followUps ?? []);

  // new follow-up form
  const [showForm, setShowForm] = useState(false);
  const [newType, setNewType] = useState<FollowUpType>("Call");
  const [newDate, setNewDate] = useState("");
  const [newNote, setNewNote] = useState("");

  // editing note
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    setFollowUps(lead.followUps ?? []);
  }, [lead]);

  useEffect(() => {
    if (preFillNote) {
      setShowForm(true);
      setNewNote(preFillNote);
      if (onClearPreFill) {
        onClearPreFill();
      }
    }
  }, [preFillNote, onClearPreFill]);

  const persist = async (updatedFollowUps: FollowUpEntry[], extraUpdates?: Partial<Lead>) => {
    const updates: Partial<Lead> = { followUps: updatedFollowUps, ...extraUpdates };
    await updateLead(lead.id, updates);
    onUpdate({ ...lead, ...updates, followUps: updatedFollowUps });
  };

  const handleAddFollowUp = async () => {
    if (!newDate) return;
    const entry: FollowUpEntry = {
      id: uuidv4(),
      type: newType,
      note: newNote,
      scheduledAt: new Date(newDate).toISOString(),
    };
    const updated = [...followUps, entry].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
    setFollowUps(updated);
    setShowForm(false);
    setNewType("Call");
    setNewDate("");
    setNewNote("");
    await persist(updated);
  };

  const handleMarkComplete = async (id: string) => {
    const updated = followUps.map((f) =>
      f.id === id ? { ...f, completedAt: new Date().toISOString() } : f
    );
    setFollowUps(updated);
    await persist(updated);
  };

  const handleSaveNote = async (id: string) => {
    const updated = followUps.map((f) =>
      f.id === id ? { ...f, note: editNote } : f
    );
    setFollowUps(updated);
    setEditingId(null);
    setEditNote("");
    await persist(updated);
  };

  const nextPending = followUps.find((f) => !f.completedAt);

  return (
    <Card id="follow-up-tracker" className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-400" />
            Follow-up Tracker
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="text-xs h-8 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add follow-up form */}
        {showForm && (
          <div className="bg-background border border-border/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                New Follow-up
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="h-6 w-6 p-0 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Type selector */}
            <div className="flex gap-1.5">
              {FOLLOW_UP_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setNewType(t.value)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      newType === t.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {t.value}
                  </button>
                );
              })}
            </div>

            <Input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{ colorScheme: "light" }}
              className="block w-full"
            />
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="e.g. Discuss 2BHK options near metro"
              rows={2}
              className="resize-none text-sm"
            />
            <Button
              onClick={handleAddFollowUp}
              disabled={!newDate}
              className="w-full cursor-pointer"
              size="sm"
            >
              Add Follow-up
            </Button>
          </div>
        )}

        {/* Timeline */}
        {followUps.length > 0 ? (
          <div className="relative pl-6">
            {/* vertical line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-4">
              {followUps.map((entry) => {
                const Icon = getTypeIcon(entry.type);
                const isCompleted = !!entry.completedAt;
                const isNext = nextPending?.id === entry.id;
                const isEditing = editingId === entry.id;

                return (
                  <div key={entry.id} className="relative">
                    {/* dot */}
                    <div
                      className={`absolute -left-6 top-1 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                        isCompleted
                          ? "bg-emerald-100 border-emerald-400"
                          : isNext
                          ? "bg-blue-100 border-blue-400"
                          : "bg-background border-border"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-2.5 w-2.5 text-emerald-600" />
                      ) : (
                        <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                      )}
                    </div>

                    <div
                      className={`rounded-lg p-3 border transition-colors ${
                        isCompleted
                          ? "bg-accent/50 border-border/30"
                          : isNext
                          ? "bg-blue-500/5 border-blue-500/20"
                          : "bg-background border-border/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-3.5 w-3.5 ${isCompleted ? "text-muted-foreground" : "text-foreground"}`} />
                          <span className={`text-xs font-semibold uppercase tracking-wider ${isCompleted ? "text-muted-foreground" : "text-foreground"}`}>
                            {entry.type}
                          </span>
                          {isNext && !isCompleted && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">
                              NEXT
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${isCompleted ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                          {formatDate(entry.scheduledAt)}
                        </span>
                      </div>

                      {/* note */}
                      {isEditing ? (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            className="flex-1 text-sm h-8"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveNote(entry.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                          />
                          <Button size="sm" className="h-8 cursor-pointer" onClick={() => handleSaveNote(entry.id)}>
                            Save
                          </Button>
                        </div>
                      ) : (
                        entry.note && (
                          <p className={`text-sm mt-1 ${isCompleted ? "text-muted-foreground/70 line-through" : "text-muted-foreground"}`}>
                            {entry.note}
                          </p>
                        )
                      )}

                      {/* completed info */}
                      {isCompleted && entry.completedAt && (
                        <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed {formatDate(entry.completedAt)}
                        </p>
                      )}

                      {/* actions */}
                      {!isCompleted && !isEditing && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs cursor-pointer"
                            onClick={() => handleMarkComplete(entry.id)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs cursor-pointer"
                            onClick={() => {
                              setEditingId(entry.id);
                              setEditNote(entry.note);
                            }}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit Note
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No follow-ups scheduled yet. Click &quot;Schedule&quot; to add one.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
