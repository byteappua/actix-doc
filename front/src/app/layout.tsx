import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Actix Doc",
  description: "Documentation Management System",
};

// Component to handle conditional sidebar rendering
function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isAuthPage = ["/login", "/register"].includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Only show sidebar when authenticated and not on auth pages
  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 border-r bg-gray-50/40 hidden md:block">
        <AppSidebar />
      </div>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthLayout>{children}</AuthLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
