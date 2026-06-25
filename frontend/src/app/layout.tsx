"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "../components/layout/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-background text-text-primary flex flex-col md:flex-row">
        <QueryClientProvider client={queryClient}>
          {/* Main App Layout Shell */}
          <div className="flex flex-col md:flex-row w-full min-h-screen">
            {/* Sidebar / Mobile Nav Navigation bar */}
            <Sidebar />

            {/* Page Router Viewport Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">
              {children}
            </div>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
