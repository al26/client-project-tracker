import { CalendarDays, Eye, Pencil, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "./ProjectBadges";
import type { Project } from "@/types/project";

function formatDate(value: string) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

interface Props {
    project: Project;
    onView: (project: Project) => void;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onView, onEdit, onDelete }: Props) {
    return (
        <article
            className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-sm"
            onClick={() => onView(project)}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold tracking-tight text-card-foreground">
                        {project.project_name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="size-3.5 shrink-0" />
                        <span className="truncate">{project.client_name}</span>
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(project);
                        }}
                        aria-label={`View ${project.project_name}`}
                        className="cursor-pointer"
                    >
                        <Eye className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(project);
                        }}
                        aria-label={`Edit ${project.project_name}`}
                        className="cursor-pointer"
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(project);
                        }}
                        aria-label={`Delete ${project.project_name}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>

            {project.description && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <StatusBadge status={project.status} />
                <PriorityBadge priority={project.priority} />
                <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5 shrink-0" />
                    {formatDate(project.start_date)} →{" "}
                    {formatDate(project.due_date)}
                </span>
            </div>
        </article>
    );
}
