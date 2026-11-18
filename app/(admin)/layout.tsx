import type { Metadata } from "next";
import "./globals.css";
import AdminGuard from "@/components/auth/AdminGuard";

export const metadata: Metadata = {
  title: "ADMIN UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AdminGuard>
          {children}
          </AdminGuard>
      </body>
    </html>
  );
}
