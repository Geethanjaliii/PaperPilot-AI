"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  GitCompare, 
  Sparkles, 
  Bookmark, 
  History, 
  Settings, 
  Activity,
  Menu,
  X,
  Plus,
  Coins,
  LogIn,
  LogOut
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/useAuthStore";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Search Papers", path: "/search", icon: Search },
  { name: "Literature Review", path: "/review", icon: FileText },
  { name: "Compare Papers", path: "/compare", icon: GitCompare },
  { name: "Ask Papers", path: "/ask", icon: Sparkles },
  { name: "Citations", path: "/citations", icon: Bookmark },
  { name: "Saved Papers", path: "/saved", icon: Bookmark },
  { name: "Pricing", path: "/pricing", icon: Coins },
  { name: "History", path: "/history", icon: History },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Check API health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get("/health");
        if (res.data?.status === "healthy") {
          setApiOnline(true);
        } else {
          setApiOnline(false);
        }
      } catch {
        setApiOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (nameStr: string) => {
    return nameStr.split(" ").map(n => n[0]).join("");
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border-color min-h-screen text-text-secondary select-none p-4 justify-between shrink-0">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-3">
            <span className="text-xl font-bold tracking-tight text-primary-accent flex items-center gap-1.5">
              <span className="w-2.5 h-6 bg-primary-accent rounded-full inline-block"></span>
              PaperPilot AI
            </span>
            <span className="text-[10px] font-semibold bg-primary-accent/10 border border-primary-accent/30 text-primary-accent rounded px-1.5 py-0.5 uppercase tracking-wide">
              PRO
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const active = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium ${
                    active 
                      ? "bg-primary-accent/10 text-primary-accent border border-primary-accent/20" 
                      : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-105 ${active ? "text-primary-accent" : "text-text-secondary group-hover:text-text-primary"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-4 border-t border-border-color pt-4">
          {/* API Status Check */}
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-text-secondary" />
              API Server
            </span>
            <span className={`flex items-center gap-1 font-semibold ${apiOnline ? "text-primary-accent" : "text-rose-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${apiOnline ? "bg-primary-accent animate-pulse" : "bg-rose-500"}`}></span>
              {apiOnline === null ? "Checking..." : apiOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* User Profile Card / Login Button */}
          {isLoggedIn ? (
            <div className="flex items-center justify-between bg-card-bg/60 p-2.5 rounded-2xl border border-border-color gap-2 group/profile">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-primary-accent/20 border border-primary-accent/30 flex items-center justify-center font-bold text-primary-accent text-xs shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold text-text-primary truncate">{user.name}</span>
                  <span className="text-[10px] text-text-secondary truncate">{user.organization}</span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-text-secondary transition-colors cursor-pointer shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-accent hover:bg-hover-accent text-background font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Top Navigation Header */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 bg-surface border-b border-border-color text-text-primary sticky top-0 z-50">
        <button onClick={() => setMobileMenuOpen(true)} className="p-1 hover:bg-white/5 rounded-lg text-text-secondary">
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-lg font-bold tracking-tight text-primary-accent">PaperPilot AI</span>
        {isLoggedIn ? (
          <div className="w-8 h-8 rounded-full bg-primary-accent/20 border border-primary-accent/30 flex items-center justify-center font-bold text-primary-accent text-xs">
            {getInitials(user.name)}
          </div>
        ) : (
          <Link href="/login" className="text-xs text-primary-accent font-bold">Sign In</Link>
        )}
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-72 bg-surface p-4 flex flex-col justify-between border-r border-border-color animate-slide-in">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-border-color pb-3">
                <span className="text-lg font-bold text-primary-accent">PaperPilot AI</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-white/5 rounded-lg text-text-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1.5" onClick={() => setMobileMenuOpen(false)}>
                {menuItems.map((item) => {
                  const active = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        active 
                          ? "bg-primary-accent/10 text-primary-accent" 
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex flex-col gap-4 border-t border-border-color pt-4">
              <div className="flex items-center justify-between text-xs px-1">
                <span>API Server Status</span>
                <span className={`font-semibold ${apiOnline ? "text-primary-accent" : "text-rose-500"}`}>
                  {apiOnline ? "Online" : "Offline"}
                </span>
              </div>
              
              {isLoggedIn ? (
                <div className="flex items-center justify-between bg-card-bg/60 p-2.5 rounded-xl border border-border-color">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-primary-accent/20 flex items-center justify-center font-bold text-primary-accent text-xs">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-semibold text-text-primary truncate">{user.name}</span>
                      <span className="text-[10px] text-text-secondary truncate">{user.organization}</span>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="p-1.5 hover:bg-white/5 rounded-lg text-text-secondary">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-accent text-background font-bold text-xs rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Mobile Bottom Navigation Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border-color flex md:hidden items-center justify-around py-2 px-1 text-[10px] text-text-secondary">
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg ${pathname === "/" ? "text-primary-accent" : "text-text-secondary"}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        
        <Link 
          href="/search" 
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg ${pathname === "/search" ? "text-primary-accent" : "text-text-secondary"}`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </Link>

        {/* Center Floating Action Plus Button */}
        <Link 
          href="/ask"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-accent text-white shadow-lg shadow-primary-accent/30 -translate-y-4 hover:scale-105 active:scale-95 transition-transform duration-200"
        >
          <Plus className="w-6 h-6" />
        </Link>

        <Link 
          href="/ask" 
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg ${pathname === "/ask" ? "text-primary-accent" : "text-text-secondary"}`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Ask</span>
        </Link>

        <Link 
          href="/review" 
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg ${pathname === "/review" ? "text-primary-accent" : "text-text-secondary"}`}
        >
          <FileText className="w-5 h-5" />
          <span>Review</span>
        </Link>
      </nav>
    </>
  );
}
