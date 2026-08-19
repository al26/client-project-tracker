import { cn } from "@/lib/utils";
import type { ProjectPriority, ProjectStatus } from "@/types/project";

const statusStyles: Record<ProjectStatus, string> = {
    Planning:
        "bg-status-planning/12 text-status-planning ring-status-planning/25",
    "In Progress":
        "bg-status-progress/12 text-status-progress ring-status-progress/25",
    "On Hold": "bg-status-hold/12 text-status-hold ring-status-hold/25",
    Completed: "bg-status-done/12 text-status-done ring-status-done/25",
};

const priorityStyles: Record<ProjectPriority, string> = {
    Low: "bg-priority-low/12 text-priority-low ring-priority-low/25",
    Medium: "bg-priority-medium/12 text-priority-medium ring-priority-medium/25",
    High: "bg-priority-high/12 text-priority-high ring-priority-high/25",
};

const base =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap";

export function StatusBadge({ status }: { status: ProjectStatus }) {
    return (
        <span className={cn(base, statusStyles[status])}>
            <span className="size-1.5 rounded-full bg-current" aria-hidden />
            {status}
        </span>
    );
}

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
    return (
        <span className={cn(base, priorityStyles[priority])}>{priority}</span>
    );
}
