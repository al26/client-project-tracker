import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PriorityBadge, StatusBadge } from "./ProjectBadges";
import type { Project } from "@/types/project";

interface Props {
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
}

function formatDate(value: string) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function ProjectDetailDialog({
    project,
    open,
    onOpenChange,
    onEdit,
    onDelete,
}: Props) {
    if (!project) return null;

    const handleEdit = () => {
        onOpenChange(false);
        onEdit(project);
    };

    const handleDelete = () => {
        onOpenChange(false);
        onDelete(project);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="pr-8">Project Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-2xl font-semibold tracking-tight">
                            {project.project_name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {project.client_name}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <StatusBadge status={project.status} />
                        <PriorityBadge priority={project.priority} />
                    </div>

                    {project.description && (
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Description
                            </h4>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                                {project.description}
                            </p>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Start Date
                            </h4>
                            <p className="mt-1 text-sm">
                                {formatDate(project.start_date)}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Due Date
                            </h4>
                            <p className="mt-1 text-sm">
                                {formatDate(project.due_date)}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between gap-3 border-t border-border pt-4">
                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                            Delete Project
                        </Button>
                        <Button onClick={handleEdit}>
                            <Pencil className="size-4" />
                            Edit Project
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
