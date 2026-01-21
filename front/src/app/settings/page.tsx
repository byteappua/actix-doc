"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <div className="bg-card rounded-lg border p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {user?.username || "Guest User"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Member since {new Date().getFullYear()}
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Account</h3>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
