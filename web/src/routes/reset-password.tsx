import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { authApi } from "@/services/auth-api";

const title = "Choose a new password — Client Project Tracker";
const description = "Set a new password using the reset token emailed to you.";

const searchSchema = z.object({
    token: z.string().optional(),
    email: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
    validateSearch: searchSchema,
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
    component: ResetPasswordPage,
});

const schema = z
    .object({
        token: z.string().min(1, "Reset token is required"),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Enter a valid email"),
        password: z.string().min(8, "Use at least 8 characters"),
        password_confirmation: z.string().min(1, "Confirm your password"),
    })
    .refine((values) => values.password === values.password_confirmation, {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    });

function ResetPasswordPage() {
    const search = Route.useSearch();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            token: search.token ?? "",
            email: search.email ?? "",
            password: "",
            password_confirmation: "",
        },
    });

    const hasPrefilledToken = Boolean(search.token);
    const hasPrefilledEmail = Boolean(search.email);

    const onSubmit = async (values: z.infer<typeof schema>) => {
        setSubmitting(true);
        try {
            await authApi.resetPassword(values);
            toast.add({
                type: "success",
                title: "Password updated",
                description: "You can sign in with your new password.",
            });
            void navigate({ to: "/login", replace: true });
        } catch (error) {
            toast.add({
                type: "error",
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not reset the password",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="New password"
            description={
                hasPrefilledToken
                    ? "Enter a new password below. Your email is prefilled from the reset link."
                    : "Enter the token from your email and pick a new password."
            }
            footer={
                <p>
                    <Link
                        to="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Back to sign in
                    </Link>
                </p>
            }
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {(!hasPrefilledToken || !hasPrefilledEmail) && (
                        <>
                            {!hasPrefilledToken && (
                                <FormField
                                    control={form.control}
                                    name="token"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reset token</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Token from the email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            {!hasPrefilledEmail && (
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    autoComplete="email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </>
                    )}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        autoComplete="new-password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password_confirmation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm new password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        autoComplete="new-password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        Update password
                    </Button>
                </form>
            </Form>
        </AuthShell>
    );
}
