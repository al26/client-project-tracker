import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
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

const title = "Verify your email — Client Project Tracker";
const description =
    "Enter the 6-character code we emailed you to activate your account.";

const searchSchema = z.object({
    token: z.string().optional(),
});

export const Route = createFileRoute("/verify-email")({
    validateSearch: searchSchema,
    head: () => ({
        meta: [
            { title },
            { name: "description", content: description },
            { property: "og:title", content: title },
            { property: "og:description", content: description },
            { property: "og:type", content: "website" },
            { name: "robots", content: "noindex" },
        ],
    }),
    component: VerifyEmailPage,
});

const OTP_LENGTH = 6;

const schema = z.object({
    token: z
        .string()
        .length(OTP_LENGTH, `Enter the ${OTP_LENGTH}-character code`),
});

const RESEND_KEY_PREFIX = "cpt.verify.resendAt";

function useResendCountdown() {
    const getRemaining = () => {
        if (typeof localStorage === "undefined") return 0;
        const at = Number(localStorage.getItem(RESEND_KEY_PREFIX) ?? "0");
        return Math.max(0, Math.ceil((at - Date.now()) / 1000));
    };

    const [remaining, setRemaining] = useState(getRemaining);

    useEffect(() => {
        const timer = setInterval(() => setRemaining(getRemaining()), 1000);
        return () => clearInterval(timer);
    }, []);

    const start = () => {
        const at = Date.now() + 120_000; // 2 minute cooldown on FE
        localStorage.setItem(RESEND_KEY_PREFIX, String(at));
        setRemaining(120);
    };

    return { remaining, start };
}

function VerifyEmailPage() {
    const { user, isLoading, isVerified, refresh } = useAuth();
    const navigate = useNavigate();
    const search = Route.useSearch();

    const magicToken = search.token;
    const magicAttemptedRef = useRef(false);
    const isVerifyingMagic = Boolean(magicToken) && !magicAttemptedRef.current;

    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [magicError, setMagicError] = useState<string | null>(null);
    const { remaining: resendRemaining, start: startResendCountdown } =
        useResendCountdown();

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { token: "" },
    });

    // Magic link flow: verify via the API once, then head to the dashboard.
    useEffect(() => {
        if (!magicToken || magicAttemptedRef.current || isVerified) return;
        magicAttemptedRef.current = true;
        setMagicError(null);

        const verify = async () => {
            try {
                await authApi.verifyMagicLink(magicToken);
                await refresh();
                toast.add({
                    type: "success",
                    title: "Email verified",
                    description: "Welcome aboard!",
                });
                void navigate({ to: "/", replace: true });
            } catch (error) {
                // Keep the loader view showing an inline error with a resend action.
                setMagicError(
                    error instanceof Error
                        ? error.message
                        : "That link didn't work. Try entering the code manually.",
                );
            }
        };

        void verify();
    }, [magicToken, isVerified, refresh, navigate]);

    // Already verified (e.g. token was consumed earlier)? Go straight to the dashboard.
    useEffect(() => {
        if (isLoading || !isVerified) return;
        void navigate({ to: "/", replace: true });
    }, [isLoading, isVerified, navigate]);

    // Redirect unauthenticated visitors to login unless verifying via a magic link.
    useEffect(() => {
        if (magicToken || isLoading || !!user) {
            return;
        }
        void navigate({ to: "/login", replace: true });
    }, [magicToken, isLoading, user, navigate]);

    const onSubmit = async (values: z.infer<typeof schema>) => {
        setSubmitting(true);
        try {
            await authApi.verifyOtp(values.token);
            toast.add({
                type: "success",
                title: "Email verified",
                description: "Welcome aboard!",
            });
            await refresh();
            void navigate({ to: "/", replace: true });
        } catch (error) {
            toast.add({
                type: "error",
                title: "Invalid code",
                description:
                    error instanceof Error
                        ? error.message
                        : "That code didn't work. Check the email we sent you.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (resendRemaining > 0 || resending) return;
        setResending(true);
        try {
            await authApi.resendVerification(user?.email ?? "");
            startResendCountdown();
            toast.add({
                type: "success",
                title: "Code sent",
                description: "A fresh code is on its way to your inbox.",
            });
        } catch (error) {
            toast.add({
                type: "error",
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not resend the code.",
            });
        } finally {
            setResending(false);
        }
    };

    // Resend from the failed magic-link view, then fall back to the OTP form.
    const handleMagicResend = async () => {
        if (resending) return;
        setResending(true);
        try {
            await authApi.resendVerification(user?.email ?? "");
            startResendCountdown();
            setMagicError(null);
            toast.add({
                type: "success",
                title: "Code sent",
                description: "A fresh code is on its way to your inbox.",
            });
            void navigate({ to: "/verify-email", replace: true });
        } catch (error) {
            toast.add({
                type: "error",
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not resend the code.",
            });
        } finally {
            setResending(false);
        }
    };

    // Plain fallback to the OTP form from the failed magic-link view.
    const goToVerificationForm = () => {
        setMagicError(null);
        void navigate({ to: "/verify-email", replace: true });
    };

    if (isLoading || isVerified) {
        // Loading, or already verified and about to be redirected to the dashboard.
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <AuthShell
            title="Verify your email"
            description={
                isVerifyingMagic
                    ? "Verifying your account…"
                    : magicError
                      ? "We couldn't verify with that link."
                      : `Enter the ${OTP_LENGTH}-character code we emailed to ${
                            user?.email ?? "your inbox"
                        }.`
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
            {isVerifyingMagic ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <MailCheck className="size-10 text-primary" />
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Verifying your email…
                    </p>
                </div>
            ) : magicError ? (
                <div className="space-y-4 py-4 text-center">
                    <p className="text-sm text-destructive">{magicError}</p>
                    <Button
                        type="button"
                        className="w-full"
                        disabled={resending}
                        onClick={handleMagicResend}
                    >
                        {resending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        Resend verification link
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={goToVerificationForm}
                    >
                        Continue to verification form
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="token"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Verification code</FormLabel>
                                        <FormControl>
                                            <Input
                                                value={field.value}
                                                onChange={(event) => {
                                                    const next =
                                                        event.target.value
                                                            .toUpperCase()
                                                            .replace(/\s/g, "")
                                                            .slice(
                                                                0,
                                                                OTP_LENGTH,
                                                            );
                                                    field.onChange(next);
                                                }}
                                                inputMode="text"
                                                autoComplete="one-time-code"
                                                placeholder="A1B2C3"
                                                maxLength={OTP_LENGTH}
                                                className="text-center text-lg tracking-[0.5em] uppercase"
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
                                Verify email
                            </Button>
                        </form>
                    </Form>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={resendRemaining > 0 || resending}
                        onClick={handleResend}
                    >
                        {resending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        {resendRemaining > 0
                            ? `Resend in ${resendRemaining}s`
                            : "Resend code"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                        {resendRemaining > 0
                            ? `You can request a new code in ${resendRemaining}s.`
                            : "Didn't get it? Check spam or resend the code."}
                    </p>
                </div>
            )}
        </AuthShell>
    );
}
