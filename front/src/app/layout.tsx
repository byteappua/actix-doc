import type { Metadata } from "next";
import "./globals.css";
import AuthLayout from "@/components/layout/AuthLayout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const fontSans = {
  variable: "--font-sans",
  className: "font-sans",
};

export const metadata: Metadata = {
  title: "Actix Doc",
  description: "Documentation Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={fontSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthLayout>{children}</AuthLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
