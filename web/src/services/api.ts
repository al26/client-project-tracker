import type {
    PaginatedResponse,
    PaginationMeta,
    Project,
    ProjectInput,
} from "@/types/project";
import { authToken } from "./auth-token";
import { mockDb } from "./mock-db";

/**
 * Centralized API layer.
 *
 * Swap to a real REST API by setting VITE_API_BASE_URL (e.g. http://localhost:8000)
 * — every call below then hits the Laravel Sanctum API at `/api/projects`.
 * While it is empty, requests are served by the in-memory mock backend in `./mock-db`.
 */
export const API_BASE_URL: string = import.meta.env["VITE_API_BASE_URL"] ?? "";

export const USE_MOCK = API_BASE_URL.trim() === "";

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    signal?: AbortSignal | undefined;
};

type ApiEnvelope<T> = { data: T };

export class ApiError extends Error {
    status: number;
    errors: Record<string, string[]>;

    constructor(
        message: string,
        status: number,
        errors: Record<string, string[]> = {},
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }
}

function authHeaders(): Record<string, string> {
    const token = authToken.get();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeProject(raw: Record<string, unknown>): Project {
    return {
        id: String(raw["id"]),
        client_name: String(raw["client_name"]),
        project_name: String(raw["project_name"]),
        description: String(raw["description"] ?? ""),
        status: raw["status"] as Project["status"],
        priority: raw["priority"] as Project["priority"],
        start_date: String(raw["start_date"]),
        due_date: String(raw["due_date"]),
    };
}

async function request<T>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const { method = "GET", body, signal } = options;

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        ...(signal ? { signal } : {}),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...authHeaders(),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;
        let errors: Record<string, string[]> = {};
        try {
            const data = (await response.json()) as {
                message?: string;
                errors?: Record<string, string[]>;
            };
            if (data?.message) message = data.message;
            if (data?.errors) errors = data.errors;
        } catch {
            /* response had no JSON body */
        }
        throw new ApiError(message, response.status, errors);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}

async function requestProject(
    path: string,
    options: RequestOptions = {},
): Promise<Project> {
    const payload = await request<ApiEnvelope<Record<string, unknown>>>(
        path,
        options,
    );
    return normalizeProject(payload.data);
}

async function requestProjects(
    path: string,
    options: RequestOptions = {},
): Promise<PaginatedResponse<Project>> {
    const payload = await request<{
        data: Record<string, unknown>[];
        meta?: PaginationMeta;
    }>(path, options);

    return {
        data: payload.data.map(normalizeProject),
        meta: payload.meta ?? {
            current_page: 1,
            last_page: 1,
            per_page: payload.data.length,
            total: payload.data.length,
            from: 1,
            to: payload.data.length,
        },
    };
}

export interface ProjectsQueryParams {
    search?: string;
    status?: string;
    priority?: string;
    sort_by?: string;
    sort_direction?: "asc" | "desc";
    per_page?: number;
    page?: number;
}

function buildQueryString(params: ProjectsQueryParams): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : "";
}

export const projectsApi = {
    getProjects: (
        params?: ProjectsQueryParams,
        signal?: AbortSignal | undefined,
    ): Promise<PaginatedResponse<Project>> => {
        if (USE_MOCK) {
            return mockDb.list().then((data) => ({
                data,
                meta: {
                    current_page: 1,
                    last_page: 1,
                    per_page: data.length,
                    total: data.length,
                    from: 1,
                    to: data.length,
                },
            }));
        }

        const queryString = params ? buildQueryString(params) : "";
        return requestProjects(
            `/api/projects${queryString}`,
            signal ? { signal } : {},
        );
    },

    getProject: (
        id: string,
        signal?: AbortSignal | undefined,
    ): Promise<Project> =>
        USE_MOCK
            ? mockDb.get(id)
            : requestProject(`/api/projects/${id}`, signal ? { signal } : {}),

    createProject: (input: ProjectInput): Promise<Project> =>
        USE_MOCK
            ? mockDb.create(input)
            : requestProject("/api/projects", { method: "POST", body: input }),

    updateProject: (id: string, input: ProjectInput): Promise<Project> =>
        USE_MOCK
            ? mockDb.update(id, input)
            : requestProject(`/api/projects/${id}`, {
                  method: "PUT",
                  body: input,
              }),

    deleteProject: (id: string): Promise<void> =>
        USE_MOCK
            ? mockDb.remove(id)
            : request<void>(`/api/projects/${id}`, { method: "DELETE" }),
};
