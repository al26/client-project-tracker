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
import { authApi } from "@/services/auth-api";

const title = "Sign in — Client Project Tracker";
const description =
    "Sign in to manage your client projects, deadlines and priorities.";

export const Route = createFileRoute("/login")({
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
    component: LoginPage,
});

const schema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

function LoginPage() {
    const { login, isAuthenticated, isVerified } = useAuth();
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
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (values: z.infer<typeof schema>) => {
        setSubmitting(true);
        try {
            await login(values);
            toast.add({ type: "success", title: "Welcome back" });
            void navigate({ to: "/", replace: true });
        } catch (error) {
            toast.add({
                type: "error",
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not sign in",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Sign in"
            description="Use your account to access the tracker."
            footer={
                <div className="space-y-1">
                    <p>
                        No account?{" "}
                        <Link
                            to="/register"
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                    <p>
                        <Link
                            to="/forgot-password"
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </Link>
                    </p>
                </div>
            }
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
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
                                        autoComplete="current-password"
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
                        Sign in
                    </Button>
                    {authApi.usingMock ? (
                        <p className="text-center text-xs text-muted-foreground">
                            Demo mode: demo@example.com / password
                        </p>
                    ) : null}
                </form>
            </Form>
        </AuthShell>
    );
}
