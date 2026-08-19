import {
    queryOptions,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { projectsApi, type ProjectsQueryParams } from "@/services/api";
import type { ProjectInput } from "@/types/project";

export const projectsQueryOptions = (params?: ProjectsQueryParams) =>
    queryOptions({
        queryKey: ["projects", params],
        queryFn: ({ signal }) => projectsApi.getProjects(params, signal),
    });

export function useProjects(params?: ProjectsQueryParams) {
    return useQuery(projectsQueryOptions(params));
}

function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: ProjectInput) => projectsApi.createProject(input),
        onSuccess: (project) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.add({
                type: "success",
                title: "Project created",
                description: `${project.project_name} was added.`,
            });
        },
        onError: (error) =>
            toast.add({
                type: "error",
                title: "Error",
                description: errorMessage(
                    error,
                    "Could not create the project",
                ),
            }),
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: ProjectInput }) =>
            projectsApi.updateProject(id, input),
        onSuccess: (project) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({
                queryKey: ["projects", project.id],
            });
            toast.add({
                type: "success",
                title: "Project updated",
                description: `${project.project_name} was saved.`,
            });
        },
        onError: (error) =>
            toast.add({
                type: "error",
                title: "Error",
                description: errorMessage(
                    error,
                    "Could not update the project",
                ),
            }),
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => projectsApi.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.add({ type: "success", title: "Project deleted" });
        },
        onError: (error) =>
            toast.add({
                type: "error",
                title: "Error",
                description: errorMessage(
                    error,
                    "Could not delete the project",
                ),
            }),
    });
}
