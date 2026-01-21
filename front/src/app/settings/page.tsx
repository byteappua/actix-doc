"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { ModeToggle } from "@/components/theme/ModeToggle";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";

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
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Appearance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Customize how the app looks on your device.
                  </p>
                </div>
                <ModeToggle />
              </div>
              <div className="space-y-3">
                <p className="font-medium">Color</p>
                <ThemeCustomizer />
              </div>
            </div>
          </div>

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
