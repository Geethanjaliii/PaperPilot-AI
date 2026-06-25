"use client";

import PageContainer from "../../components/layout/PageContainer";
import { Check, Star, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const faqs = [
    { q: "Can I use PaperPilot for free?", a: "Yes." },
    { q: "Can I cancel anytime?", a: "Yes." },
    { q: "Do you store my papers?", a: "Only bookmarks and history you choose to save." },
    { q: "Can teams collaborate?", a: "Yes, through shared collections and workspaces." }
  ];

  return (
    <PageContainer 
      title="Pricing" 
      subtitle="From students to research teams."
    >
      <div className="flex-1 flex flex-col gap-12 max-w-5xl mx-auto w-full pb-12 select-none">
        
        {/* Hero Section */}
        <div className="text-center flex flex-col gap-3 max-w-lg mx-auto">
          <h2 className="text-2xl md:text-4xl font-black text-text-primary tracking-tight">
            Choose your research workflow.
          </h2>
          <p className="text-xs md:text-sm text-text-secondary">
            From students to research teams.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Card 1: Free */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-6 flex flex-col justify-between hover:border-white/10 transition-all duration-300 relative group">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Free</span>
                <span className="text-3xl font-black text-text-primary">₹0<span className="text-xs text-text-secondary font-medium">/month</span></span>
              </div>
              
              <div className="h-[1px] bg-border-color"></div>

              <ul className="flex flex-col gap-3 text-xs text-text-secondary font-medium">
                {[
                  "50 searches/day",
                  "Search arXiv",
                  "Search Semantic Scholar",
                  "Save bookmarks",
                  "APA citations",
                  "Basic literature reviews",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-center">
                    <Check className="w-3.5 h-3.5 text-primary-accent shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              href="/signup"
              className="mt-8 w-full py-2.5 bg-white/5 border border-border-color hover:bg-white/10 text-text-primary font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer"
            >
              Get Started
            </Link>
          </div>

          {/* Card 2: Pro (Most Popular) */}
          <div className="bg-card-bg border-2 border-primary-accent rounded-2xl p-6 flex flex-col justify-between shadow-glow shadow-primary-accent/25 relative transform hover:-translate-y-1 transition-all duration-300">
            {/* Most Popular badge */}
            <div className="absolute -top-3.5 right-6 bg-primary-accent text-background text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md shadow-primary-accent/25">
              <Star className="w-3 h-3 fill-background" />
              Most Popular
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-primary-accent uppercase tracking-widest flex items-center gap-1">
                  Pro ⭐
                </span>
                <span className="text-3xl font-black text-text-primary">₹499<span className="text-xs text-text-secondary font-medium">/month</span></span>
              </div>
              
              <div className="h-[1px] bg-border-color"></div>

              <ul className="flex flex-col gap-3 text-xs text-text-secondary font-medium">
                {[
                  "Unlimited searches",
                  "Advanced AI literature reviews",
                  "Methodology comparison",
                  "Ask Papers (Perplexity mode)",
                  "Citation exports",
                  "Collections & tags",
                  "Search history sync",
                  "Priority AI responses",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-center">
                    <Check className="w-3.5 h-3.5 text-primary-accent shrink-0" />
                    <span className="text-text-primary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              href="/signup"
              className="mt-8 w-full py-2.5 bg-primary-accent hover:bg-hover-accent text-background font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-primary-accent/15"
            >
              Start Pro
            </Link>
          </div>

          {/* Card 3: Teams */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-6 flex flex-col justify-between hover:border-white/10 transition-all duration-300 relative group">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Teams</span>
                <span className="text-3xl font-black text-text-primary">₹1,499<span className="text-xs text-text-secondary font-medium">/month</span></span>
              </div>
              
              <div className="h-[1px] bg-border-color"></div>

              <ul className="flex flex-col gap-3 text-xs text-text-secondary font-medium">
                <li className="text-text-primary font-bold mb-1">Everything in Pro</li>
                {[
                  "Team workspaces",
                  "Shared collections",
                  "Collaborative annotations",
                  "Admin dashboard",
                  "Usage analytics",
                  "Priority support",
                  "Unlimited exports",
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-center">
                    <Check className="w-3.5 h-3.5 text-primary-accent shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a 
              href="mailto:sales@paperpilot.ai"
              className="mt-8 w-full py-2.5 bg-white/5 border border-border-color hover:bg-white/10 text-text-primary font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer"
            >
              Contact Sales
            </a>
          </div>

        </div>

        {/* FAQ Section */}
        <section className="mt-8 border-t border-border-color pt-12">
          <h3 className="text-sm font-extrabold tracking-widest text-text-secondary uppercase mb-8 text-center flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary-accent" />
            FAQ Section
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-card-bg/60 border border-border-color p-4 rounded-xl flex flex-col gap-1">
                <h4 className="text-xs md:text-sm font-bold text-text-primary">{faq.q}</h4>
                <p className="text-[11px] md:text-xs text-text-secondary leading-relaxed mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="bg-card-bg border border-border-color rounded-2xl p-8 text-center flex flex-col items-center gap-4 relative overflow-hidden mt-6">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-accent to-secondary-accent"></div>
          <h3 className="text-lg md:text-xl font-black text-text-primary tracking-tight">
            Ready to accelerate your research?
          </h3>
          <div className="flex gap-3 justify-center w-full max-w-xs mt-2">
            <Link 
              href="/signup"
              className="flex-1 py-2 bg-primary-accent hover:bg-hover-accent text-background font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-primary-accent/15"
            >
              Start Free
            </Link>
            <Link 
              href="/signup"
              className="flex-1 py-2 bg-white/5 border border-border-color hover:bg-white/10 text-text-primary font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer"
            >
              Explore Pro
            </Link>
          </div>
        </section>

      </div>
    </PageContainer>
  );
}
