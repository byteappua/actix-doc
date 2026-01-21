"use client";

import { useAuth, AuthProvider } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { usePathname } from "next/navigation";

// Internal component to use auth context
function AuthContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = ["/login", "/register"].includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Only show sidebar when authenticated and not on auth pages
  if (!isAuthenticated && !isLoading) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 border-r bg-gray-50/40 hidden md:block">
        <AppSidebar />
      </div>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthContent>{children}</AuthContent>
    </AuthProvider>
  );
}
