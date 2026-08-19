import { ChevronRight, FolderKanban, LogOut, Plus, User } from "lucide-react";
import { Link, useNavigate, useMatches } from "@tanstack/react-router";

import { Button, buttonVariants } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { SignOutDialog } from "@/components/auth/SignOutDialog";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

interface AppHeaderProps {
    onCreateProject?: () => void;
}

interface Breadcrumb {
    label: string;
    to?: string;
}

const SHOW_SIGNOUT_DIALOG = import.meta.env.VITE_SHOW_SIGNOUT_DIALOG === "true";

export function AppHeader({ onCreateProject }: AppHeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const matches = useMatches();
    const [showSignOut, setShowSignOut] = useState(false);

    const initials = user?.name
        ? user.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
        : "?";

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

    // Build breadcrumbs based on current route
    const breadcrumbs: Breadcrumb[] = [];
    const currentPath = matches[matches.length - 1]?.pathname || "/";

    if (currentPath === "/") {
        breadcrumbs.push({ label: "Projects" });
    } else if (currentPath === "/profile") {
        breadcrumbs.push({ label: "Projects", to: "/" });
        breadcrumbs.push({ label: "Profile" });
    }

    return (
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <FolderKanban className="size-5" />
                        </span>
                        <div className="leading-tight">
                            <p className="text-sm font-semibold tracking-tight sm:text-base">
                                Client Project Tracker
                            </p>
                            <p className="hidden text-xs text-muted-foreground sm:block">
                                Every engagement, status and deadline in one
                                place
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-1.5">
                    <ThemeToggle />

                    {onCreateProject && (
                        <Button
                            onClick={onCreateProject}
                            size="sm"
                            className="cursor-pointer"
                        >
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">
                                New project
                            </span>
                            <span className="sm:hidden">New</span>
                        </Button>
                    )}

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className={
                                    buttonVariants({
                                        variant: "ghost",
                                        size: "icon",
                                    }) + " cursor-pointer"
                                }
                                aria-label="Account menu"
                            >
                                <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                                    {initials}
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="leading-tight">
                                        <span className="block text-sm">
                                            {user.name}
                                        </span>
                                        <span className="block text-xs font-normal text-muted-foreground">
                                            {user.email}
                                        </span>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        void navigate({ to: "/profile" })
                                    }
                                    className="cursor-pointer"
                                >
                                    <User className="size-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="cursor-pointer"
                                >
                                    <LogOut className="size-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link
                            to="/login"
                            className={
                                buttonVariants({
                                    variant: "outline",
                                    size: "sm",
                                }) + " cursor-pointer"
                            }
                        >
                            Sign in
                        </Link>
                    )}
                </div>
            </div>

            {breadcrumbs.length > 1 && (
                <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center gap-1.5 text-sm"
                    >
                        {breadcrumbs.map((crumb, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1.5"
                            >
                                {index > 0 && (
                                    <ChevronRight className="size-4 text-muted-foreground" />
                                )}
                                {crumb.to ? (
                                    <Link
                                        to={crumb.to}
                                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-foreground">
                                        {crumb.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
            )}

            {SHOW_SIGNOUT_DIALOG && (
                <SignOutDialog
                    open={showSignOut}
                    onOpenChange={setShowSignOut}
                />
            )}
        </header>
    );
}
