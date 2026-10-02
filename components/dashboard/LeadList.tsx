"use client";

import { Lead, PriorityLabel } from "@/types/lead";
import LeadListItem from "./LeadListItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Users, Flame, Sun, Snowflake } from "lucide-react";

interface LeadListProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (id: string) => void;
  filter: PriorityLabel | "ALL";
  onFilterChange: (filter: PriorityLabel | "ALL") => void;
}

const FILTERS: { label: string; value: PriorityLabel | "ALL"; icon?: React.ElementType; color?: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Hot", value: "HOT", icon: Flame, color: "text-red-400" },
  { label: "Warm", value: "WARM", icon: Sun, color: "text-amber-400" },
  { label: "Cold", value: "COLD", icon: Snowflake, color: "text-blue-400" },
];

export default function LeadList({
  leads,
  selectedLeadId,
  onSelectLead,
  filter,
  onFilterChange,
}: LeadListProps) {
  // sort by priority score descending
  const sorted = [...leads].sort(
    (a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0)
  );

  // apply filter
  const filtered =
    filter === "ALL"
      ? sorted
      : sorted.filter((l) => l.priorityLabel === filter);

  return (
    <div className="flex flex-col h-full text-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Leads
          </h2>
          <span className="text-xs text-gray-400 ml-auto">
            {leads.length}
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.value}
                onClick={() => onFilterChange(f.value)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                  filter === f.value
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {Icon && (
                  <Icon className={cn("h-3.5 w-3.5", filter === f.value ? "text-white" : f.color)} />
                )}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lead items */}
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No {filter !== "ALL" ? filter.toLowerCase() : ""} leads found.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filtered.map((lead) => (
              <LeadListItem
                key={lead.id}
                lead={lead}
                isSelected={lead.id === selectedLeadId}
                onClick={() => onSelectLead(lead.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
