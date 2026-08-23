import { z } from "zod";
import { PRIORITIES, STATUSES } from "@/types/project";

export const projectSchema = z
    .object({
        client_name: z
            .string()
            .trim()
            .min(1, { message: "Client name is required" })
            .max(100, { message: "Client name must be under 100 characters" }),
        project_name: z
            .string()
            .trim()
            .min(1, { message: "Project name is required" })
            .max(120, { message: "Project name must be under 120 characters" }),
        description: z.string().trim().max(1000, {
            message: "Description must be under 1000 characters",
        }),
        status: z.enum(STATUSES, { message: "Select a valid status" }),
        priority: z.enum(PRIORITIES, { message: "Select a valid priority" }),
        start_date: z.string().min(1, { message: "Start date is required" }),
        due_date: z.string().min(1, { message: "Due date is required" }),
    })
    .refine((data) => new Date(data.due_date) >= new Date(data.start_date), {
        message: "Due date cannot be earlier than the start date",
        path: ["due_date"],
    });

export type ProjectFormValues = z.infer<typeof projectSchema>;
