import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, buttonVariants } from "@/components/ui/button";
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

const title = "Reset your password — Client Project Tracker";
const description =
    "Request a password reset link for your Client Project Tracker account.";

export const Route = createFileRoute("/forgot-password")({
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
    component: ForgotPasswordPage,
});

const schema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

const RESEND_COOLDOWN_SECONDS = 120;
const RESEND_KEY_PREFIX = "cpt.reset.resendAt";

function useResendCountdown(email: string) {
    const storageKey = `${RESEND_KEY_PREFIX}:${email.toLowerCase()}`;
    const getRemaining = () => {
        if (typeof localStorage === "undefined") return 0;
        const at = Number(localStorage.getItem(storageKey) ?? "0");
        return Math.max(0, Math.ceil((at - Date.now()) / 1000));
    };

    const [remaining, setRemaining] = useState(getRemaining);

    useEffect(() => {
        const timer = setInterval(() => {
            setRemaining(getRemaining());
        }, 1000);
        return () => clearInterval(timer);
    }, [storageKey]);

    const start = useCallback(() => {
        const at = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
        localStorage.setItem(storageKey, String(at));
        setRemaining(RESEND_COOLDOWN_SECONDS);
    }, [storageKey]);

    return { remaining, start };
}

function ForgotPasswordPage() {
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState("");
    const { remaining: resendRemaining, start: startResendCountdown } =
        useResendCountdown(email);

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (values: z.infer<typeof schema>) => {
        setSubmitting(true);
        try {
            await authApi.forgotPassword(values.email);
            setEmail(values.email);
            setSent(true);
            startResendCountdown();
            toast.add({
                type: "success",
                title: "Reset link sent",
                description: "Check your inbox for the reset email.",
            });
        } catch (error) {
            toast.add({
                type: "error",
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not send the reset link",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (resendRemaining > 0 || !email) return;
        setSubmitting(true);
        try {
            await authApi.forgotPassword(email);
            startResendCountdown();
            toast.add({
                type: "success",
                title: "Reset link sent",
                description: "Check your inbox for the reset email.",
            });
        } catch (error) {
            toast.add({
                type: "error",
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not send the reset link",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Forgot password"
            description="We'll email you a link to choose a new password."
            footer={
                <p>
                    Remembered it?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Back to sign in
                    </Link>
                </p>
            }
        >
            {sent ? (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        If an account exists for that address, a reset link is
                        on its way.
                    </p>
                    <Link
                        to="/reset-password"
                        className={
                            buttonVariants({ variant: "outline" }) + " w-full"
                        }
                    >
                        I have a reset token
                    </Link>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={resendRemaining > 0 || submitting}
                        onClick={handleResend}
                    >
                        {submitting ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        {resendRemaining > 0
                            ? `Resend in ${resendRemaining}s`
                            : "Resend reset link"}
                    </Button>
                    {resendRemaining > 0 ? (
                        <p className="text-center text-xs text-muted-foreground">
                            You can request another link in {resendRemaining}s.
                        </p>
                    ) : null}
                </div>
            ) : (
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
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : null}
                            Send reset link
                        </Button>
                    </form>
                </Form>
            )}
        </AuthShell>
    );
}
