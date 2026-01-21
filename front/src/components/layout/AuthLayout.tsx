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

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Show children even if not authenticated (auth will handle redirect)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

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
