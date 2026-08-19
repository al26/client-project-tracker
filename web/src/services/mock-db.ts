import type { Project, ProjectInput } from "@/types/project";

/**
 * In-memory mock backend. Used only while `API_BASE_URL` is empty.
 * Delete this file once a real REST API is wired up.
 */

let projects: Project[] = [
    {
        id: "1",
        client_name: "Northwind Coffee",
        project_name: "Storefront Redesign",
        description:
            "Rebuild the online store with a new checkout flow and loyalty program.",
        status: "In Progress",
        priority: "High",
        start_date: "2026-07-06",
        due_date: "2026-09-18",
    },
    {
        id: "2",
        client_name: "Halcyon Labs",
        project_name: "Analytics Dashboard",
        description:
            "Internal reporting dashboard with cohort retention and revenue charts.",
        status: "Planning",
        priority: "Medium",
        start_date: "2026-08-17",
        due_date: "2026-11-02",
    },
    {
        id: "3",
        client_name: "Meridian Legal",
        project_name: "Client Intake Portal",
        description:
            "Secure intake forms, document upload and automated case routing.",
        status: "On Hold",
        priority: "Low",
        start_date: "2026-05-11",
        due_date: "2026-08-29",
    },
    {
        id: "4",
        client_name: "Bright Harbor Studio",
        project_name: "Brand Site Launch",
        description:
            "Marketing site with case studies, CMS integration and SEO groundwork.",
        status: "Completed",
        priority: "High",
        start_date: "2026-03-02",
        due_date: "2026-06-14",
    },
];

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockDb = {
    async list(): Promise<Project[]> {
        await delay();
        return [...projects];
    },
    async get(id: string): Promise<Project> {
        await delay(200);
        const found = projects.find((p) => p.id === id);
        if (!found) throw new Error("Project not found");
        return found;
    },
    async create(input: ProjectInput): Promise<Project> {
        await delay();
        const project: Project = { ...input, id: crypto.randomUUID() };
        projects = [project, ...projects];
        return project;
    },
    async update(id: string, input: ProjectInput): Promise<Project> {
        await delay();
        const index = projects.findIndex((p) => p.id === id);
        if (index === -1) throw new Error("Project not found");
        const updated: Project = { ...input, id };
        projects = projects.map((p, i) => (i === index ? updated : p));
        return updated;
    },
    async remove(id: string): Promise<void> {
        await delay();
        if (!projects.some((p) => p.id === id))
            throw new Error("Project not found");
        projects = projects.filter((p) => p.id !== id);
    },
};
