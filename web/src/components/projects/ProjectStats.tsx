import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Layers, Timer } from "lucide-react";
import type { Project } from "@/types/project";

function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    hint: string;
    icon: typeof Layers;
    tone: string;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {label}
                </p>
                <Icon className={`size-4 ${tone}`} />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-card-foreground">
                {value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
    );
}

export function ProjectStats({ projects }: { projects: Project[] }) {
    const stats = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        const active = projects.filter(
            (p) => p.status === "In Progress",
        ).length;
        const completed = projects.filter(
            (p) => p.status === "Completed",
        ).length;
        const overdue = projects.filter(
            (p) => p.status !== "Completed" && p.due_date < today,
        ).length;
        return { total: projects.length, active, completed, overdue };
    }, [projects]);

    return (
        <section
            aria-label="Overview"
            className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
            <StatCard
                label="Total"
                value={stats.total}
                hint="All engagements"
                icon={Layers}
                tone="text-muted-foreground"
            />
            <StatCard
                label="In progress"
                value={stats.active}
                hint="Currently active"
                icon={Timer}
                tone="text-status-progress"
            />
            <StatCard
                label="Completed"
                value={stats.completed}
                hint="Delivered"
                icon={CheckCircle2}
                tone="text-status-done"
            />
            <StatCard
                label="Overdue"
                value={stats.overdue}
                hint="Past due date"
                icon={AlertTriangle}
                tone="text-priority-high"
            />
        </section>
    );
}
