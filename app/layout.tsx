import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ExpenseTracker - Professional Expense Management & Reporting",
    template: "%s | ExpenseTracker"
  },
  description: "Streamline your expense tracking, reporting, and reimbursement process with our comprehensive expense management platform. Features include receipt upload, automated categorization, approval workflows, and detailed analytics for businesses and individuals.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <LoadingProvider>{children}</LoadingProvider>
          <Toaster />
        </body>
      </html>
    </SessionProvider>
  );
}
