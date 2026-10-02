import { Lead } from "@/types/lead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Flame, Calendar, ArrowRight } from "lucide-react";
import PriorityBadge from "./PriorityBadge";

interface PipelineDashboardProps {
  leads: Lead[];
  onSelectLead: (id: string) => void;
}

export default function PipelineDashboard({ leads, onSelectLead }: PipelineDashboardProps) {
  const hotLeads = leads.filter((l) => l.priorityLabel === "HOT");
  
  const leadsWithPendingFollowUp = leads.filter((l) => 
    l.followUps?.some((f) => !f.completedAt)
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background/50 pt-14">
      <div className="max-w-5xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Pipeline Overview</h1>
          <p className="text-muted-foreground">Here is what's happening with your leads today.</p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="bg-card shadow-sm border-border/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Leads</p>
                <p className="text-4xl font-bold text-foreground">{leads.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Hot Pipeline</p>
                <p className="text-4xl font-bold text-foreground">{hotLeads.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Flame className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Action Needed</p>
                <p className="text-4xl font-bold text-foreground">{leadsWithPendingFollowUp.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Calendar className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Action Needed */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-500" />
                Pending Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 -my-4">
              <div className="divide-y divide-border/50 max-h-[300px] overflow-y-auto">
                {leadsWithPendingFollowUp.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No pending follow-ups. You're all caught up!</div>
                ) : (
                  leadsWithPendingFollowUp.slice(0, 5).map(lead => {
                    const pending = lead.followUps?.find(f => !f.completedAt);
                    return (
                      <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors cursor-pointer group" onClick={() => onSelectLead(lead.id)}>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm text-foreground">{lead.name}</p>
                            {pending && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                                {pending.type}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{lead.propertyRequirement}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Priority Leads */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-500" />
                Top Priority Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 -my-4">
              <div className="divide-y divide-border/50 max-h-[300px] overflow-y-auto">
                {hotLeads.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No hot leads right now. Keep qualifying!</div>
                ) : (
                  hotLeads.sort((a,b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0)).slice(0, 5).map(lead => (
                    <div key={lead.id} className="p-4 flex flex-col justify-center hover:bg-accent/50 transition-colors cursor-pointer group" onClick={() => onSelectLead(lead.id)}>
                      <div className="flex items-center justify-between w-full">
                        <p className="font-medium text-sm text-foreground mb-1.5">{lead.name}</p>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="self-start">
                        <PriorityBadge label={lead.priorityLabel!} score={lead.priorityScore!} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
