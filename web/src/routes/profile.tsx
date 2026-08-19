import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "@/components/ui/toast";
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
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/services/auth-api";
import { SignOutDialog } from "@/components/auth/SignOutDialog";
import { AppHeader } from "@/components/AppHeader";

const SHOW_SIGNOUT_DIALOG = import.meta.env.VITE_SHOW_SIGNOUT_DIALOG === "true";

const title = "Your profile — Client Project Tracker";
const description =
    "Update your account details and password for the Client Project Tracker.";

export const Route = createFileRoute("/profile")({
    head: () => ({
        meta: [
            { title },
            { name: "description", content: description },
            { property: "og:title", content: title },
            { property: "og:description", content: description },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "robots", content: "noindex" },
        ],
    }),
    component: () => (
        <RequireAuth>
            <ProfilePage />
        </RequireAuth>
    ),
});

const profileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

const passwordSchema = z
    .object({
        current_password: z.string().min(1, "Current password is required"),
        password: z.string().min(8, "Use at least 8 characters"),
        password_confirmation: z.string().min(1, "Confirm your password"),
    })
    .refine((values) => values.password === values.password_confirmation, {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    });

function ProfilePage() {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [showSignOut, setShowSignOut] = useState(false);

    const handleSignOut = async () => {
        if (SHOW_SIGNOUT_DIALOG) {
            setShowSignOut(true);
            return;
        }

        // Instant logout
        try {
            await logout();
            toast.add({ type: "success", description: "Signed out" });
            void navigate({ to: "/login", replace: true });
        } catch {
            toast.add({ type: "error", description: "Could not sign out" });
        }
    };

    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: "", email: "" },
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            current_password: "",
            password: "",
            password_confirmation: "",
        },
    });

    useEffect(() => {
        if (user) {
            profileForm.reset({ name: user.name, email: user.email });
        }
    }, [user]);

    const onSaveProfile = async (values: z.infer<typeof profileSchema>) => {
        setSavingProfile(true);
        try {
            setUser(await authApi.updateProfile(values));
            toast.add({ type: "success", title: "Profile updated" });
        } catch (error) {
            toast.add({
                type: "error",
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not update the profile",
            });
        } finally {
            setSavingProfile(false);
        }
    };

    const onSavePassword = async (values: z.infer<typeof passwordSchema>) => {
        setSavingPassword(true);
        try {
            await authApi.updatePassword(values);
            passwordForm.reset({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
            toast.add({ type: "success", title: "Password updated" });
        } catch (error) {
            toast.add({
                type: "error",
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not update the password",
            });
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <AppHeader />

            <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Profile
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your account details and password.
                    </p>
                </div>

                <section className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-base font-medium text-card-foreground">
                        Account details
                    </h2>
                    <Form {...profileForm}>
                        <form
                            onSubmit={profileForm.handleSubmit(onSaveProfile)}
                            className="mt-4 space-y-4"
                        >
                            <FormField
                                control={profileForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                autoComplete="name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={profileForm.control}
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
                            <Button type="submit" disabled={savingProfile}>
                                {savingProfile ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : null}
                                Save changes
                            </Button>
                        </form>
                    </Form>
                </section>

                <section className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-base font-medium text-card-foreground">
                        Change password
                    </h2>
                    <Form {...passwordForm}>
                        <form
                            onSubmit={passwordForm.handleSubmit(onSavePassword)}
                            className="mt-4 space-y-4"
                        >
                            <FormField
                                control={passwordForm.control}
                                name="current_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current password</FormLabel>
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
                            <FormField
                                control={passwordForm.control}
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
                                control={passwordForm.control}
                                name="password_confirmation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Confirm new password
                                        </FormLabel>
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
                            <Button type="submit" disabled={savingPassword}>
                                {savingPassword ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : null}
                                Update password
                            </Button>
                        </form>
                    </Form>
                </section>

                <section className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-base font-medium text-card-foreground">
                        Session
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Sign out of this device.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-4 cursor-pointer"
                        onClick={handleSignOut}
                    >
                        <LogOut className="size-4" />
                        Sign out
                    </Button>
                </section>
            </main>
            {SHOW_SIGNOUT_DIALOG && (
                <SignOutDialog
                    open={showSignOut}
                    onOpenChange={setShowSignOut}
                />
            )}
        </div>
    );
}
