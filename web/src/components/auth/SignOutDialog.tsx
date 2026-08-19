import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/toast";

export function SignOutDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [timeLeft, setTimeLeft] = useState(3);
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) {
            setTimeLeft(3);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [open]);

    useEffect(() => {
        if (open && timeLeft === 0) {
            const performLogout = async () => {
                try {
                    await logout();
                    toast.add({ type: "success", description: "Signed out" });
                    onOpenChange(false);
                    void navigate({ to: "/login", replace: true });
                } catch {
                    toast.add({
                        type: "error",
                        description: "Could not sign out",
                    });
                    onOpenChange(false);
                }
            };
            void performLogout();
        }
    }, [timeLeft, open, logout, navigate, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Signing out</DialogTitle>
                    <DialogDescription>
                        You will be signed out in {timeLeft} second
                        {timeLeft !== 1 ? "s" : ""}...
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
