import { useEffect, useState } from "react";
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
import { useAuth } from "@/hooks/use-auth";

const title = "Create an account — Client Project Tracker";
const description =
    "Register to start tracking client projects, statuses and deadlines.";

export const Route = createFileRoute("/register")({
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
    component: RegisterPage,
});

const schema = z
    .object({
        name: z.string().min(1, "Name is required"),
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

function RegisterPage() {
    const { register, isAuthenticated, isVerified } = useAuth();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (isVerified) {
            void navigate({ to: "/", replace: true });
        } else {
            void navigate({ to: "/verify-email", replace: true });
        }
    }, [isAuthenticated, isVerified, navigate]);

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof schema>) => {
        setSubmitting(true);
        try {
            await register(values);
            toast.add({
                type: "success",
                title: "Account created",
                description: "Check your inbox to verify your email.",
            });
            void navigate({ to: "/verify-email", replace: true });
        } catch (error) {
            toast.add({
                type: "error",
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not create the account",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Create an account"
            description="A few details and you're in."
            footer={
                <p>
                    Already registered?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            }
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        autoComplete="name"
                                        placeholder="Jane Doe"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                                        placeholder="you@company.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
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
                                <FormLabel>Confirm password</FormLabel>
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
                        Create account
                    </Button>
                </form>
            </Form>
        </AuthShell>
    );
}
