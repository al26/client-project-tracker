import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
    ArrowDownAZ,
    ArrowUpAZ,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AppHeader } from "@/components/AppHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { ProjectDetailDialog } from "@/components/projects/ProjectDetailDialog";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import {
    useCreateProject,
    useDeleteProject,
    useProjects,
    useUpdateProject,
} from "@/hooks/use-projects";
import {
    PRIORITIES,
    STATUSES,
    type Project,
    type ProjectInput,
} from "@/types/project";

const title = "Client Project Tracker — Manage Client Work in One Dashboard";
const description =
    "Track client projects, statuses, priorities and deadlines in a fast, responsive dashboard with quick create, edit and delete.";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title },
            { name: "description", content: description },
            { property: "og:title", content: title },
            { property: "og:description", content: description },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
    }),
    component: () => (
        <RequireAuth>
            <Index />
        </RequireAuth>
    ),
});

const SORT_FIELDS = [
    { value: "project_name", label: "Project name" },
    { value: "client_name", label: "Client name" },
    { value: "start_date", label: "Start date" },
    { value: "due_date", label: "Due date" },
    { value: "status", label: "Status" },
    { value: "priority", label: "Priority" },
] as const;

type SortField = (typeof SORT_FIELDS)[number]["value"];

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

function Index() {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    const [viewing, setViewing] = useState<Project | null>(null);
    const [deleting, setDeleting] = useState<Project | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All Statuses");
    const [priorityFilter, setPriorityFilter] =
        useState<string>("All Priorities");
    const [sortField, setSortField] = useState<SortField>("start_date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(10);

    const debouncedSearch = useDebounce(search, 300);

    const queryParams = {
        search: debouncedSearch || undefined,
        status:
            statusFilter !== "All Statuses" && statusFilter !== "all"
                ? statusFilter
                : undefined,
        priority:
            priorityFilter !== "All Priorities" && priorityFilter !== "all"
                ? priorityFilter
                : undefined,
        sort_by: sortField,
        sort_direction: sortDirection,
        per_page: perPage,
        page: currentPage,
    };

    const { data, isLoading, isError, error, refetch } =
        useProjects(queryParams);
    const createProject = useCreateProject();
    const updateProject = useUpdateProject();
    const deleteProject = useDeleteProject();

    const projects = data?.data ?? [];
    const meta = data?.meta;

    useEffect(() => {
        setCurrentPage(1);
    }, [
        debouncedSearch,
        statusFilter,
        priorityFilter,
        sortField,
        sortDirection,
    ]);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (project: Project) => {
        setEditing(project);
        setFormOpen(true);
    };

    const handleSubmit = async (values: ProjectInput) => {
        try {
            if (editing) {
                await updateProject.mutateAsync({
                    id: editing.id,
                    input: values,
                });
            } else {
                await createProject.mutateAsync(values);
            }
            setFormOpen(false);
            setEditing(null);
        } catch {
            /* toast already surfaced by the mutation */
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await deleteProject.mutateAsync(deleting.id);
            setDeleting(null);
        } catch {
            /* toast already surfaced by the mutation */
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (meta && currentPage < meta.last_page) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <AppHeader onCreateProject={openCreate} />

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Projects
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isLoading
                                ? "Loading engagements…"
                                : meta
                                  ? `${meta.from ?? 0}-${meta.to ?? 0} of ${meta.total} engagements`
                                  : `${projects.length} engagements`}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by project or client"
                            className="pl-9"
                            aria-label="Search projects"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                            setStatusFilter(value ?? "All Statuses")
                        }
                    >
                        <SelectTrigger
                            className="w-full sm:w-44"
                            aria-label="Filter by status"
                        >
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                            <SelectItem value="All Statuses">
                                All Statuses
                            </SelectItem>
                            {STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={priorityFilter}
                        onValueChange={(value) =>
                            setPriorityFilter(value ?? "All Priorities")
                        }
                    >
                        <SelectTrigger
                            className="w-full sm:w-40"
                            aria-label="Filter by priority"
                        >
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                            <SelectItem value="All Priorities">
                                All Priorities
                            </SelectItem>
                            {PRIORITIES.map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                    {priority}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                        <Select
                            items={SORT_FIELDS}
                            value={sortField}
                            onValueChange={(value) =>
                                setSortField(value as SortField)
                            }
                        >
                            <SelectTrigger
                                className="flex-1 sm:w-44"
                                aria-label="Sort by"
                            >
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false}>
                                {SORT_FIELDS.map((field) => (
                                    <SelectItem
                                        key={field.value}
                                        value={field.value}
                                    >
                                        {field.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setSortDirection((current) =>
                                    current === "asc" ? "desc" : "asc",
                                )
                            }
                            aria-label={
                                sortDirection === "asc"
                                    ? "Sorted ascending, switch to descending"
                                    : "Sorted descending, switch to ascending"
                            }
                            title={
                                sortDirection === "asc"
                                    ? "Ascending"
                                    : "Descending"
                            }
                        >
                            {sortDirection === "asc" ? (
                                <ArrowDownAZ className="size-4" />
                            ) : (
                                <ArrowUpAZ className="size-4" />
                            )}
                        </Button>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-32 w-full rounded-xl md:h-24"
                            />
                        ))
                    ) : isError ? (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                            <p className="text-sm text-destructive">
                                {error instanceof Error
                                    ? error.message
                                    : "Could not load projects."}
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => refetch()}
                            >
                                Try again
                            </Button>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-12 text-center">
                            <FolderOpen className="mx-auto size-8 text-muted-foreground" />
                            <h2 className="mt-3 text-base font-medium">
                                No projects found
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {debouncedSearch ||
                                statusFilter !== "All Statuses" ||
                                priorityFilter !== "All Priorities"
                                    ? "Try adjusting your search or filters."
                                    : "Create your first client project to get started."}
                            </p>
                            <Button className="mt-4" onClick={openCreate}>
                                New project
                            </Button>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onView={setViewing}
                                onEdit={openEdit}
                                onDelete={setDeleting}
                            />
                        ))
                    )}
                </div>

                {meta && meta.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {meta.current_page} of {meta.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1 || isLoading}
                            >
                                <ChevronLeft className="size-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={
                                    currentPage === meta.last_page || isLoading
                                }
                            >
                                Next
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            <ProjectDetailDialog
                project={viewing}
                open={viewing !== null}
                onOpenChange={(open) => {
                    if (!open) setViewing(null);
                }}
                onEdit={openEdit}
                onDelete={setDeleting}
            />

            <ProjectFormDialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setEditing(null);
                }}
                project={editing}
                onSubmit={handleSubmit}
                isPending={createProject.isPending || updateProject.isPending}
            />

            <DeleteProjectDialog
                project={deleting}
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleting(null);
                }}
                onConfirm={handleDelete}
                isPending={deleteProject.isPending}
            />
        </div>
    );
}
