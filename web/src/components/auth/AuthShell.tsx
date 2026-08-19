import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AuthShell({
    title,
    description,
    children,
    footer,
}: {
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                <Link to="/" className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <FolderKanban className="size-4" />
                    </span>
                    <span className="text-sm font-semibold tracking-tight">
                        Client Project Tracker
                    </span>
                </Link>
                <ThemeToggle />
            </div>

            <main className="flex flex-1 items-center justify-center px-4 py-8">
                <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h1 className="text-xl font-semibold tracking-tight text-card-foreground">
                        {title}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                    <div className="mt-6">{children}</div>
                    {footer ? (
                        <div className="mt-6 text-sm text-muted-foreground">
                            {footer}
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
