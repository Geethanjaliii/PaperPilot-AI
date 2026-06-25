"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  Mail, 
  Lock, 
  Loader2, 
  Sparkles 
} from "lucide-react";
import ResearchGraphCanvas from "../../components/shared/ResearchGraphCanvas";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login loading delay
    setTimeout(() => {
      login(email || "geethanjali@example.com");
      setLoading(false);
      router.push("/");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-text-primary overflow-hidden font-sans select-none relative">
      
      {/* Background Interactive Particles (Full screen backdrop) */}
      <div className="absolute inset-0 z-0 opacity-40">
        <ResearchGraphCanvas />
      </div>

      {/* Left side: Login Card and Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32 z-10 bg-background/40 backdrop-blur-md relative border-r border-border-color/30">
        <div className="mx-auto w-full max-w-sm flex flex-col gap-6">
          
          {/* Logo & Header */}
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-black tracking-tight text-primary-accent flex items-center gap-2">
              <span className="w-2.5 h-6 bg-primary-accent rounded-full inline-block"></span>
              PaperPilot AI
            </span>
            <div className="flex flex-col mt-2">
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                Accelerate research with AI.
              </h2>
              <p className="text-xs text-text-secondary mt-1 font-semibold tracking-wider">
                Search • Review • Compare • Cite
              </p>
            </div>
          </div>

          {/* Social Logins */}
          <div className="flex flex-col gap-2.5 mt-2">
            <button 
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-card-bg hover:bg-white/5 border border-border-color rounded-xl text-xs font-bold text-text-primary transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button 
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-card-bg hover:bg-white/5 border border-border-color rounded-xl text-xs font-bold text-text-primary transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center text-[10px] text-text-secondary/50 font-bold tracking-widest mt-1">
            <div className="flex-1 h-[1px] bg-border-color/65"></div>
            <span className="px-3">OR EMAIL</span>
            <div className="flex-1 h-[1px] bg-border-color/65"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            {/* Hero Copy (Welcome back) inside/above form */}
            <div className="flex flex-col mb-1">
              <h3 className="text-sm font-bold text-text-primary">
                Welcome back to PaperPilot AI
              </h3>
              <p className="text-[11px] text-text-secondary">
                Your AI-powered Research Operating System.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Email</label>
              <div className="relative flex items-center bg-card-bg border border-border-color focus-within:border-primary-accent/40 rounded-xl p-1 transition-all">
                <Mail className="w-4 h-4 text-text-secondary ml-3 shrink-0" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-text-primary outline-none py-2 px-3 placeholder:text-text-secondary/40"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Password</label>
              <div className="relative flex items-center bg-card-bg border border-border-color focus-within:border-primary-accent/40 rounded-xl p-1 transition-all">
                <Lock className="w-4 h-4 text-text-secondary ml-3 shrink-0" />
                <input
                  type="password"
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-text-primary outline-none py-2 px-3 placeholder:text-text-secondary/40"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-accent hover:bg-hover-accent disabled:bg-primary-accent/45 disabled:cursor-not-allowed text-background font-bold text-sm py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-accent/5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-text-secondary border-t border-border-color/30 pt-4 mt-2">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary-accent hover:text-hover-accent font-bold underline">
              Sign Up
            </Link>
          </div>

        </div>
      </div>

      {/* Right side: Animated scientific graph nodes (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-surface/30 border-l border-border-color/30 relative items-center justify-center p-12 overflow-hidden select-none z-10">
        
        {/* Animated Research Graph Background inside right panel */}
        <div className="absolute inset-0 opacity-60 pointer-events-none">
          <ResearchGraphCanvas />
        </div>

        {/* Emerald Glow Gradients */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary-accent/15 blur-[120px] pointer-events-none animate-pulse duration-5000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[150px] pointer-events-none animate-pulse duration-7000"></div>

        <div className="max-w-md w-full flex flex-col gap-6 z-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-primary-accent tracking-widest uppercase">RESEARCH OPERATING SYSTEM</span>
            <h3 className="text-xl md:text-2xl font-black text-text-primary tracking-tight leading-tight">
              Empower your reading pipeline with multi-agent intelligence.
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mt-2">
              Accelerate discovery by charting citation pathways, evaluating complex methodologies side-by-side, and compiling automated literature review drafts.
            </p>
          </div>

          {/* Floating Card Mockups */}
          <div className="flex flex-col gap-5 mt-4 relative">
            
            {/* Mock Card 1 - Literature Review */}
            <div className="bg-[#151A28]/85 border border-border-color rounded-2xl p-4 flex flex-col gap-2 transform -rotate-1 hover:rotate-0 hover:scale-[1.01] hover:border-primary-accent/40 transition-all duration-300 shadow-xl backdrop-blur-md cursor-default group">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-extrabold text-primary-accent tracking-widest uppercase">Literature review</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary-accent animate-ping"></span>
              </div>
              <h4 className="text-xs font-bold text-text-primary group-hover:text-primary-accent transition-colors">Neural Architectures for Semantic Discovery</h4>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Successfully analyzed the methodology section. Key findings: Transformer-based predictions reduce MD simulation overhead...
              </p>
            </div>

            {/* Mock Card 2 - Pilot Response */}
            <div className="bg-[#151A28]/95 border border-primary-accent/30 shadow-glow rounded-2xl p-4 flex flex-col gap-2 transform translate-x-6 rotate-1 hover:rotate-0 hover:scale-[1.01] hover:border-primary-accent/50 transition-all duration-300 backdrop-blur-md cursor-default group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary-accent animate-pulse" />
                  <span className="text-[9px] font-extrabold text-primary-accent tracking-widest uppercase">Pilot response</span>
                </div>
                <span className="text-[8px] bg-primary-accent/10 border border-primary-accent/30 text-primary-accent px-1 py-0.5 rounded font-black">COMPLETED</span>
              </div>
              <h4 className="text-xs font-bold text-text-primary group-hover:text-primary-accent transition-colors">Methodology Comparison Matrix</h4>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Physics-Informed GNNs adopt residual MSE loss algorithms with 84% ensemble adoption rates in recent publications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
