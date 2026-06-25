"use client";

import { useEffect, useState } from "react";
import { subscribeToRateLimit, RateLimitState } from "../../lib/api";
import { AlertCircle, Timer, ShieldAlert } from "lucide-react";

interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageContainer({
  children,
  title,
  subtitle,
  actions,
}: PageContainerProps) {
  const [rateLimit, setRateLimit] = useState<RateLimitState>({
    isRateLimited: false,
    retryAfter: 0,
    message: "",
  });
  
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToRateLimit((state) => {
      setRateLimit(state);
      setCountdown(state.retryAfter);
    });
    return () => unsubscribe();
  }, []);

  // Handle rate-limit countdown
  useEffect(() => {
    if (rateLimit.isRateLimited && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [rateLimit.isRateLimited, countdown]);

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-6 text-text-primary px-4 md:px-8 py-6 relative">
      {/* Rate Limit floating banner */}
      {rateLimit.isRateLimited && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-bounce">
          <div className="bg-rose-950/95 border border-rose-500/30 text-rose-200 px-4 py-3.5 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-rose-300">Google Gemini API Quota Exceeded</span>
                <span className="text-rose-400/80">{rateLimit.message}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-900/60 border border-rose-500/20 px-2.5 py-1 rounded-xl text-xs font-bold text-rose-300">
              <Timer className="w-3.5 h-3.5 animate-pulse" />
              <span>Retry in {countdown}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-border-color pb-5 mt-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-text-primary via-text-primary to-text-secondary bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-text-secondary font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </header>

      {/* Page Body */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
