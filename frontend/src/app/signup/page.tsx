"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../store/useAuthStore";
import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Building,
  Check, 
  ShieldCheck
} from "lucide-react";
import ResearchGraphCanvas from "../../components/shared/ResearchGraphCanvas";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!agree) {
      alert("You must agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login(email);
      updateProfile({
        name: fullName || "Geethanjali V N",
        organization: organization || "Velammal Engineering College",
      });
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

      {/* Left side: Signup form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32 z-10 bg-background/40 backdrop-blur-md border-r border-border-color/30 relative">
        <div className="mx-auto w-full max-w-sm flex flex-col gap-5">
          
          {/* Header */}
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-black tracking-tight text-primary-accent flex items-center gap-2">
              <span className="w-2.5 h-6 bg-primary-accent rounded-full inline-block"></span>
              PaperPilot AI
            </span>
            <div className="flex flex-col mt-2">
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                Create your research account
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                From literature search to structured citations in seconds.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Full Name</label>
              <div className="relative flex items-center bg-card-bg border border-border-color focus-within:border-primary-accent/40 rounded-xl p-0.5 transition-all">
                <User className="w-4 h-4 text-text-secondary ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Geethanjali V N"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-text-primary outline-none py-2 px-3 placeholder:text-text-secondary/40"
                  required
                />
              </div>
            </div>

            {/* University / Org */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">University / Organization</label>
              <div className="relative flex items-center bg-card-bg border border-border-color focus-within:border-primary-accent/40 rounded-xl p-0.5 transition-all">
                <Building className="w-4 h-4 text-text-secondary ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Velammal Engineering College"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-text-primary outline-none py-2 px-3 placeholder:text-text-secondary/40"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Email Address</label>
              <div className="relative flex items-center bg-card-bg border border-border-color focus-within:border-primary-accent/40 rounded-xl p-0.5 transition-all">
                <Mail className="w-4 h-4 text-text-secondary ml-3 shrink-0" />
                <input
                  type="email"
                  placeholder="geethanjali@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-text-primary outline-none py-2 px-3 placeholder:text-text-secondary/40"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Password</label>
              <div className="relative flex items-center bg-card-bg border border-border-color focus-within:border-primary-accent/40 rounded-xl p-0.5 transition-all">
                <Lock className="w-4 h-4 text-text-secondary ml-3 shrink-0" />
                <input
                  type="password"
                  placeholder="Create secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-text-primary outline-none py-2 px-3 placeholder:text-text-secondary/40"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Confirm Password</label>
              <div className="relative flex items-center bg-card-bg border border-border-color focus-within:border-primary-accent/40 rounded-xl p-0.5 transition-all">
                <Lock className="w-4 h-4 text-text-secondary ml-3 shrink-0" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-text-primary outline-none py-2 px-3 placeholder:text-text-secondary/40"
                  required
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-center gap-2.5 text-[11px] text-text-secondary cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="rounded border-border-color accent-primary-accent cursor-pointer w-4 h-4"
              />
              <span>I agree to Terms and Privacy Policy</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-accent hover:bg-hover-accent disabled:bg-primary-accent/40 disabled:cursor-not-allowed text-background font-bold text-sm py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-accent/5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </button>
          </form>

          {/* Footer Nav */}
          <div className="text-center text-xs text-text-secondary border-t border-border-color/30 pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-accent hover:text-hover-accent font-bold underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>

      {/* Right side: Benefits dashboard list (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-surface/30 border-l border-border-color/30 relative items-center justify-center p-12 overflow-hidden select-none z-10">
        
        {/* Interactive research graph canvas on the right side */}
        <div className="absolute inset-0 opacity-60 pointer-events-none">
          <ResearchGraphCanvas />
        </div>

        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#10B981]/10 blur-[120px] pointer-events-none animate-pulse duration-5000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#14B8A6]/10 blur-[150px] pointer-events-none animate-pulse duration-7000"></div>

        <div className="max-w-md w-full flex flex-col gap-6 z-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-primary-accent tracking-widest uppercase">JOIN THE COMMUNITY</span>
            <h3 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
              Join 1,000+ researchers using PaperPilot AI
            </h3>
          </div>

          {/* Benefits Bullet Checklist */}
          <div className="flex flex-col gap-4 mt-2">
            {[
              "Search millions of papers",
              "Generate literature reviews",
              "Compare methodologies",
              "Export citations instantly",
            ].map((benefit, idx) => (
              <div key={idx} className="flex gap-3.5 items-center">
                <div className="w-6 h-6 rounded-lg bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center text-primary-accent shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs md:text-sm text-text-secondary font-semibold">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="mt-6 bg-[#151A28]/70 border border-border-color rounded-2xl p-4 flex gap-3.5 items-center backdrop-blur-md shadow-lg">
            <ShieldCheck className="w-8 h-8 text-primary-accent shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-primary">Trusted by Academic Institutions</span>
              <span className="text-[10px] text-text-secondary">Velammal, IITs, MIT, and researchers globally.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
