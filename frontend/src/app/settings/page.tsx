"use client";

import { useState, useEffect } from "react";
import PageContainer from "../../components/layout/PageContainer";
import { useAuthStore } from "../../store/useAuthStore";
import { useSavedStore } from "../../store/useSavedStore";
import { useHistoryStore } from "../../store/useHistoryStore";
import { 
  User, 
  Trash2, 
  Download, 
  Check, 
  Camera,
  Activity,
  Plus,
  X,
  Bell,
  Eye,
  Monitor,
  Database
} from "lucide-react";

export default function SettingsPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Zustand States
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const savedPapers = useSavedStore((state) => state.savedPapers);
  const collections = useSavedStore((state) => state.collections);
  const historyItems = useHistoryStore((state) => state.historyItems);
  const clearHistory = useHistoryStore((state) => state.clearHistory);

  // Profile Form States
  const [nameInput, setNameInput] = useState(user.name || "Geethanjali V N");
  const [emailInput, setEmailInput] = useState(user.email || "geethanjali@example.com");
  const [roleInput, setRoleInput] = useState(user.role || "Student Researcher");
  const [orgInput, setOrgInput] = useState(user.organization || "Velammal Engineering College");
  const [interests, setInterests] = useState<string[]>(user.researchInterests || ["AI", "RAG", "LLM", "Computer Vision"]);
  const [newInterest, setNewInterest] = useState("");
  const [bioInput, setBioInput] = useState(user.bio || "Computer Science student interested in AI systems and research automation.");

  // Preferences Form States
  const [notifyUpdates, setNotifyUpdates] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(true);
  const [notifyRecs, setNotifyRecs] = useState(true);
  
  const [syncBookmarks, setSyncBookmarks] = useState(true);
  const [syncHistory, setSyncHistory] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  
  const [activeTheme, setActiveTheme] = useState<"emerald" | "blue" | "purple" | "slate">("emerald");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("pp_theme") as any;
    if (savedTheme && ["emerald", "blue", "purple", "slate"].includes(savedTheme)) {
      setActiveTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (themeId: "emerald" | "blue" | "purple" | "slate") => {
    const root = document.documentElement;
    if (themeId === "emerald") {
      root.style.setProperty("--primary-accent-color", "#10B981");
      root.style.setProperty("--hover-accent-color", "#34D399");
      root.style.setProperty("--glow-color", "rgba(16, 185, 129, 0.18)");
    } else if (themeId === "blue") {
      root.style.setProperty("--primary-accent-color", "#0ea5e9");
      root.style.setProperty("--hover-accent-color", "#38bdf8");
      root.style.setProperty("--glow-color", "rgba(14, 165, 233, 0.18)");
    } else if (themeId === "purple") {
      root.style.setProperty("--primary-accent-color", "#8b5cf6");
      root.style.setProperty("--hover-accent-color", "#a78bfa");
      root.style.setProperty("--glow-color", "rgba(139, 92, 246, 0.18)");
    } else if (themeId === "slate") {
      root.style.setProperty("--primary-accent-color", "#94a3b8");
      root.style.setProperty("--hover-accent-color", "#cbd5e1");
      root.style.setProperty("--glow-color", "rgba(148, 163, 184, 0.18)");
    }
    localStorage.setItem("pp_theme", themeId);
  };

  const handleThemeChange = (themeId: "emerald" | "blue" | "purple" | "slate") => {
    setActiveTheme(themeId);
    applyTheme(themeId);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameInput,
      email: emailInput,
      role: roleInput,
      organization: orgInput,
      researchInterests: interests,
      bio: bioInput,
    });
    alert("Profile settings saved successfully.");
  };

  const handleInterestAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleInterestRemove = (tag: string) => {
    setInterests(interests.filter((t) => t !== tag));
  };

  const handleExportData = () => {
    const backupData = {
      savedPapers,
      collections,
      historyItems,
      user,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `paperpilot_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyApiUrl = () => {
    navigator.clipboard.writeText("http://localhost:8000");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <PageContainer 
      title="Settings" 
      subtitle="Configure profile info, research activity statistics, and system preferences."
    >
      <div className="flex-1 flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto w-full pb-12 select-none items-start">
        
        {/* Left Column: Dedicated Profile Settings Page */}
        <div className="flex-1 w-full bg-card-bg border border-border-color rounded-2xl p-6 md:p-8">
          <form onSubmit={handleProfileSave} className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                Profile
              </h2>
              <div className="h-[1px] bg-border-color/60 w-full mt-4"></div>
            </div>

            {/* Avatar block */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Avatar</label>
              <div className="flex items-center gap-4 mt-1">
                <div className="relative w-16 h-16 rounded-full bg-primary-accent/10 border border-primary-accent/25 flex items-center justify-center font-black text-primary-accent text-xl overflow-hidden group">
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <span>{nameInput.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <button type="button" className="px-3.5 py-1.5 bg-white/5 border border-border-color hover:bg-white/10 rounded-xl text-xs font-bold text-text-primary transition-all cursor-pointer">
                    Upload Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="bg-background border border-border-color focus:border-primary-accent rounded-xl p-2.5 text-xs md:text-sm text-text-primary outline-none"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="bg-background border border-border-color focus:border-primary-accent rounded-xl p-2.5 text-xs md:text-sm text-text-primary outline-none"
                required
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Role</label>
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="bg-background border border-border-color focus:border-primary-accent rounded-xl p-2.5 text-xs md:text-sm text-text-primary outline-none"
                required
              />
            </div>

            {/* Organization */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Organization</label>
              <input
                type="text"
                value={orgInput}
                onChange={(e) => setOrgInput(e.target.value)}
                className="bg-background border border-border-color focus:border-primary-accent rounded-xl p-2.5 text-xs md:text-sm text-text-primary outline-none"
                required
              />
            </div>

            {/* Research Interests (Clickable/removable pills) */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Research Interests</label>
              
              <div className="flex flex-wrap gap-2 mt-1">
                {interests.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1.5 bg-primary-accent/10 border border-primary-accent/30 rounded-xl text-xs font-bold text-primary-accent flex items-center gap-1.5 cursor-pointer hover:bg-primary-accent/25 hover:border-primary-accent/50 transition-all"
                    onClick={() => handleInterestRemove(tag)}
                    title="Click to remove tag"
                  >
                    {tag}
                    <X className="w-3 h-3 text-primary-accent/70 hover:text-primary-accent shrink-0" />
                  </span>
                ))}
              </div>

              {/* Add tag input */}
              <div className="flex gap-2 mt-1.5">
                <input
                  type="text"
                  placeholder="Add custom scientific interest tag"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  className="flex-1 bg-background border border-border-color focus:border-primary-accent rounded-xl p-2 px-3 text-xs outline-none text-text-primary"
                />
                <button
                  type="button"
                  onClick={handleInterestAdd}
                  className="px-3 bg-white/5 border border-border-color hover:bg-white/10 hover:border-primary-accent/40 rounded-xl text-xs font-semibold text-text-primary flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Bio</label>
              <textarea
                rows={3}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                className="bg-background border border-border-color focus:border-primary-accent rounded-xl p-2.5 text-xs md:text-sm text-text-primary outline-none resize-none leading-normal"
              />
            </div>

            {/* Save Changes button */}
            <button
              type="submit"
              className="w-full bg-primary-accent hover:bg-hover-accent text-background font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-primary-accent/10 mt-2"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Right Column: Sidebar Cards (Statistics & Account Preferences) */}
        <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
          
          {/* Card 1: Research Statistics Card */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-accent" />
              <h3 className="text-sm font-extrabold tracking-widest text-text-secondary uppercase">
                Research Activity
              </h3>
            </div>
            <div className="h-[1px] bg-border-color/60 w-full my-3"></div>

            <div className="flex flex-col divide-y divide-border-color/45">
              {[
                { label: "Papers Saved", val: 42 },
                { label: "Reviews Generated", val: 18 },
                { label: "Comparisons Run", val: 9 },
                { label: "Citations Exported", val: 65 },
                { label: "Search Sessions", val: 124 },
              ].map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 text-xs text-text-secondary hover:bg-white/[0.01] transition-colors">
                  <span className="font-semibold">{stat.label}</span>
                  <span className="bg-white/5 border border-border-color px-2.5 py-0.5 rounded font-black text-text-primary">
                    {stat.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Account Preferences */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary-accent" />
                <h3 className="text-sm font-extrabold tracking-widest text-text-secondary uppercase">
                  Account Preferences
                </h3>
              </div>
              <div className="h-[1px] bg-border-color/60 w-full my-3"></div>
            </div>

            {/* Notifications Section */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-[10px] font-extrabold text-text-secondary/70 tracking-widest uppercase flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-primary-accent" />
                Notifications
              </h4>
              <div className="flex flex-col gap-2.5 text-xs text-text-secondary pl-0.5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyUpdates}
                    onChange={(e) => setNotifyUpdates(e.target.checked)}
                    className="rounded border-border-color accent-primary-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-text-primary font-semibold">Product updates</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyDigest}
                    onChange={(e) => setNotifyDigest(e.target.checked)}
                    className="rounded border-border-color accent-primary-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-text-primary font-semibold">Weekly research digest</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyRecs}
                    onChange={(e) => setNotifyRecs(e.target.checked)}
                    className="rounded border-border-color accent-primary-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-text-primary font-semibold">AI recommendations</span>
                </label>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="flex flex-col gap-2.5 border-t border-border-color/45 pt-4">
              <h4 className="text-[10px] font-extrabold text-text-secondary/70 tracking-widest uppercase flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-primary-accent" />
                Privacy
              </h4>
              <div className="flex flex-col gap-2.5 text-xs text-text-secondary pl-0.5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={syncBookmarks}
                    onChange={(e) => setSyncBookmarks(e.target.checked)}
                    className="rounded border-border-color accent-primary-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-text-primary font-semibold">Sync bookmarks</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={syncHistory}
                    onChange={(e) => setSyncHistory(e.target.checked)}
                    className="rounded border-border-color accent-primary-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-text-primary font-semibold">Sync history</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={publicProfile}
                    onChange={(e) => setPublicProfile(e.target.checked)}
                    className="rounded border-border-color accent-primary-accent w-4 h-4 cursor-pointer"
                  />
                  <span className="text-text-primary font-semibold">Public profile</span>
                </label>
              </div>
            </div>

            {/* Theme Section */}
            <div className="flex flex-col gap-3 border-t border-border-color/45 pt-4">
              <h4 className="text-[10px] font-extrabold text-text-secondary/70 tracking-widest uppercase flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-primary-accent" />
                Theme
              </h4>
              
              <div className="flex flex-col gap-2 pl-0.5">
                {[
                  { id: "emerald", name: "Emerald", color: "bg-emerald-500" },
                  { id: "blue", name: "Ocean Blue", color: "bg-cyan-500" },
                  { id: "purple", name: "Purple", color: "bg-indigo-500" },
                  { id: "slate", name: "Slate", color: "bg-slate-400" },
                ].map((t) => {
                  const active = activeTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleThemeChange(t.id as any)}
                      className="flex items-center justify-between text-xs font-semibold text-text-secondary hover:text-text-primary transition-all cursor-pointer py-1"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${t.color} border border-white/10`}></span>
                        {t.name}
                      </span>
                      <span className="text-primary-accent font-black">
                        {active ? "●" : "○"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 3: System Configurations */}
          <div className="bg-card-bg border border-border-color rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary-accent" />
                <h3 className="text-sm font-extrabold tracking-widest text-text-secondary uppercase">
                  System Config
                </h3>
              </div>
              <div className="h-[1px] bg-border-color/60 w-full my-3"></div>
            </div>

            {/* Server URL */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">FastAPI Server URL</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value="http://localhost:8000"
                  readOnly
                  className="flex-1 bg-background border border-border-color rounded-xl p-2 px-3 outline-none text-[11px] text-text-primary select-all font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyApiUrl}
                  className="px-3 py-1.5 bg-primary-accent hover:bg-hover-accent text-background font-bold rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : "Copy"}
                </button>
              </div>
            </div>

            {/* Backup export & Clear Logs */}
            <div className="flex flex-col gap-2 border-t border-border-color/45 pt-3.5 mt-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-primary">Backup Data</span>
                  <span className="text-[9px] text-text-secondary">Export local bookmarks.</span>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-2.5 py-1.5 bg-white/5 border border-border-color hover:border-primary-accent/40 rounded-xl text-[10px] font-bold text-text-primary hover:text-primary-accent flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-border-color/30 pt-3 mt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-primary">Clear History Logs</span>
                  <span className="text-[9px] text-rose-400 font-semibold">Delete local search logs.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearHistory();
                    alert("Local search logs cleared successfully.");
                  }}
                  className="px-2.5 py-1.5 bg-rose-950/20 border border-rose-500/25 hover:bg-rose-500/10 rounded-xl font-bold text-rose-300 text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Logs</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}
