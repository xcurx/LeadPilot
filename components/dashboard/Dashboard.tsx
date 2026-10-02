"use client";

import { useState, useEffect, useCallback } from "react";
import { Lead, LeadFormData, PriorityLabel } from "@/types/lead";
import {
  getLeads,
  createLead as dbCreateLead,
  updateLead,
  deleteLead as dbDeleteLead,
} from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import { calculatePriorityScore, getPriorityLabel } from "@/lib/scoring";
import LeadList from "./LeadList";
import LeadDetails from "@/components/leads/LeadDetails";
import LeadForm from "@/components/leads/LeadForm";
import Copilot from "@/components/copilot/Copilot";
import FollowUpTracker from "@/components/followup/FollowUpTracker";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Zap, PanelLeftClose, PanelLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [filter, setFilter] = useState<PriorityLabel | "ALL">("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [analyzingLeadId, setAnalyzingLeadId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;

  // seed + load
  useEffect(() => {
    const init = async () => {
      await seedDatabase();
      const allLeads = await getLeads();
      setLeads(allLeads);
      if (allLeads.length > 0) {
        // auto select the highest priority lead
        const sorted = [...allLeads].sort(
          (a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0)
        );
        setSelectedLeadId(sorted[0].id);
      }
      setInitialized(true);
    };
    init();
  }, []);

  const refreshLeads = useCallback(async () => {
    const allLeads = await getLeads();
    setLeads(allLeads);
  }, []);

  const analyzeLead = useCallback(
    async (lead: Lead) => {
      setAnalyzingLeadId(lead.id);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: lead.name,
            location: lead.location,
            propertyRequirement: lead.propertyRequirement,
            budget: lead.budget,
            buyingTimeline: lead.buyingTimeline,
            customerMessage: lead.customerMessage,
          }),
        });

        if (!response.ok) {
          throw new Error("Analysis failed");
        }

        const data = await response.json();
        const analysis = data.analysis;

        const score = calculatePriorityScore(analysis);
        const label = getPriorityLabel(score);

        await updateLead(lead.id, {
          analysis,
          priorityScore: score,
          priorityLabel: label,
        });

        await refreshLeads();
      } catch (err) {
        console.error("Failed to analyze lead:", err);
        // lead is preserved even if analysis fails
      } finally {
        setAnalyzingLeadId(null);
      }
    },
    [refreshLeads]
  );

  const handleCreateLead = useCallback(
    async (formData: LeadFormData) => {
      const now = new Date().toISOString();
      const newLead: Lead = {
        id: uuidv4(),
        ...formData,
        status: "NEW",
        createdAt: now,
        updatedAt: now,
      };

      await dbCreateLead(newLead);
      await refreshLeads();
      setSelectedLeadId(newLead.id);

      // trigger AI analysis in background
      analyzeLead(newLead);
    },
    [refreshLeads, analyzeLead]
  );

  const handleDeleteLead = useCallback(
    async (id: string) => {
      await dbDeleteLead(id);
      if (selectedLeadId === id) {
        setSelectedLeadId(null);
      }
      await refreshLeads();
    },
    [selectedLeadId, refreshLeads]
  );

  const handleLeadUpdate = useCallback(
    async (updatedLead: Lead) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
      );
    },
    []
  );

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Zap className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading LeadPilot AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } bg-[#292928] shrink-0 border-r border-border/50 flex flex-col transition-all duration-200 overflow-hidden`}
      >
        <LeadList
          leads={leads}
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
          filter={filter}
          onFilterChange={setFilter}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 cursor-pointer"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold tracking-tight">
                LeadPilot AI
              </h1>
            </div>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            size="sm"
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        </header>

        {/* Content */}
        {selectedLead ? (
          <div className="flex-1 overflow-y-auto bg-background/50">
            <div className="max-w-4xl mx-auto p-8 space-y-8">
              <LeadDetails
                lead={selectedLead}
                onRetryAnalysis={() => analyzeLead(selectedLead)}
                onDelete={() => handleDeleteLead(selectedLead.id)}
                isAnalyzing={analyzingLeadId === selectedLead.id}
              />

              <Separator className="bg-border/30" />

              {/* Copilot */}
              <Copilot lead={selectedLead} />

              <Separator className="bg-border/30" />

              {/* Follow-up */}
              <FollowUpTracker
                lead={selectedLead}
                onUpdate={handleLeadUpdate}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Zap className="h-12 w-12 mb-4 text-muted-foreground/30" />
            {leads.length === 0 ? (
              <>
                <p className="text-lg font-medium mb-2">No leads yet.</p>
                <p className="text-sm mb-4">
                  Create your first lead to get started.
                </p>
                <Button
                  onClick={() => setFormOpen(true)}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Lead
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">Select a lead</p>
                <p className="text-sm">
                  Choose a lead from the sidebar to view details.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Lead Form Dialog */}
      <LeadForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreateLead}
      />
    </div>
  );
}
