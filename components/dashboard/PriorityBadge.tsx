import { PriorityLabel } from "@/types/lead";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Flame, Snowflake, Sun } from "lucide-react";

interface PriorityBadgeProps {
  label: PriorityLabel;
  score: number;
  size?: "sm" | "md";
}

const CONFIG = {
  HOT: { icon: Flame, color: "text-red-500" },
  WARM: { icon: Sun, color: "text-amber-500" },
  COLD: { icon: Snowflake, color: "text-blue-400" },
};

export default function PriorityBadge({ label, score, size = "sm" }: PriorityBadgeProps) {
  const { icon: Icon, color } = CONFIG[label];

  return (
    <Badge
      variant="outline"
      className={cn(
        "bg-white border-border/60 shadow-sm font-semibold tracking-wider text-foreground",
        size === "md" ? "text-xs px-3 py-1.5 gap-1.5" : "text-[10px] px-2 py-1 gap-1"
      )}
    >
      <Icon className={cn(color, size === "md" ? "w-4.5 h-4.5" : "w-3.5 h-3.5")} />
      <span>{label}</span>
      <span className="text-muted-foreground font-normal px-0.5">|</span>
      <span className={color}>{score}</span>
    </Badge>
  );
}
