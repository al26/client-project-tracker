export const STATUSES = [
    "Planning",
    "In Progress",
    "On Hold",
    "Completed",
] as const;
export const PRIORITIES = ["Low", "Medium", "High"] as const;

export type ProjectStatus = (typeof STATUSES)[number];
export type ProjectPriority = (typeof PRIORITIES)[number];

export interface Project {
    id: string;
    client_name: string;
    project_name: string;
    description: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    start_date: string;
    due_date: string;
}

export type ProjectInput = Omit<Project, "id">;

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
