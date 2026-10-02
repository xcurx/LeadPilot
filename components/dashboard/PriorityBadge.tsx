import { PriorityLabel } from "@/types/lead";
import { getPriorityEmoji } from "@/lib/scoring";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  label: PriorityLabel;
  score: number;
  size?: "sm" | "md";
}

const BADGE_STYLES: Record<PriorityLabel, string> = {
  HOT: "bg-red-500/20 text-red-400 border-red-500/30",
  WARM: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  COLD: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function PriorityBadge({ label, score, size = "sm" }: PriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        BADGE_STYLES[label],
        size === "md" ? "text-sm px-3 py-1" : "text-xs px-2 py-0.5"
      )}
    >
      {getPriorityEmoji(label)} {label} · {score}
    </Badge>
  );
}
