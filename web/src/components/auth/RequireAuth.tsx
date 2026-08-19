import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/** Client-side gate. The Laravel backend must still authorize every request. */
export function RequireAuth({ children }: { children: ReactNode }) {
    const { isAuthenticated, isVerified, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            void navigate({ to: "/login", replace: true });
            return;
        }
        if (!isVerified) {
            void navigate({ to: "/verify-email", replace: true });
        }
    }, [isLoading, isAuthenticated, isVerified, navigate]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!isVerified) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return <>{children}</>;
}