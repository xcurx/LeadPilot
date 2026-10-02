"use client";

import { Lead, PriorityLabel } from "@/types/lead";
import { cn } from "@/lib/utils";
import { MapPin, Calendar, Flame, Sun, Snowflake } from "lucide-react";

interface LeadListItemProps {
  lead: Lead;
  isSelected: boolean;
  onClick: () => void;
}

const PRIORITY_ACCENT: Record<PriorityLabel, string> = {
  HOT: "border-l-red-500",
  WARM: "border-l-amber-500",
  COLD: "border-l-blue-400",
};

const CONFIG: Record<PriorityLabel, { icon: React.ElementType, color: string }> = {
  HOT: { icon: Flame, color: "text-red-400" },
  WARM: { icon: Sun, color: "text-amber-400" },
  COLD: { icon: Snowflake, color: "text-blue-400" },
};

export default function LeadListItem({ lead, isSelected, onClick }: LeadListItemProps) {
  const priorityLabel = lead.priorityLabel ?? "COLD";
  const priorityScore = lead.priorityScore ?? 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border-l-4 transition-all duration-200",
        "hover:bg-white/5 cursor-pointer",
        PRIORITY_ACCENT[priorityLabel] || "border-l-white/20",
        isSelected
          ? "bg-white/10"
          : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm text-white truncate">
          {lead.name}
        </span>
        {(() => {
          const { icon: Icon, color } = CONFIG[priorityLabel];
          return (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/20 border border-white/5 ml-2 shrink-0">
              <Icon className={cn("w-3.5 h-3.5", color)} />
              <span className={cn("text-[10px] font-bold", color)}>{priorityScore}</span>
            </div>
          );
        })()}
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1 truncate">
          <MapPin className="h-3 w-3 shrink-0" />
          {lead.location}
        </span>
        <span className="shrink-0">{lead.budget}</span>
      </div>
      {lead.followUpAt && (
        <div className="flex items-center gap-1 text-xs text-blue-300 mt-1.5">
          <Calendar className="h-3 w-3" />
          Follow-up scheduled
        </div>
      )}
    </button>
  );
}
