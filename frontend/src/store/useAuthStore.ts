import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  organization: string;
  researchInterests: string[];
  bio: string;
  avatarUrl?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile;
  login: (email: string) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: true, // Default to true so they see the populated profile immediately
      user: {
        name: "Geethanjali V N",
        email: "geethanjali@example.com",
        role: "Student Researcher",
        organization: "Velammal Engineering College",
        researchInterests: ["AI", "RAG", "LLM", "Computer Vision"],
        bio: "Computer Science student interested in AI systems and research automation.",
      },
      login: (email) => set({ 
        isLoggedIn: true,
        user: {
          name: "Geethanjali V N",
          email,
          role: "Student Researcher",
          organization: "Velammal Engineering College",
          researchInterests: ["AI", "RAG", "LLM", "Computer Vision"],
          bio: "Computer Science student interested in AI systems and research automation.",
        }
      }),
      logout: () => set({ isLoggedIn: false }),
      updateProfile: (updatedFields) => set((state) => ({
        user: { ...state.user, ...updatedFields }
      })),
    }),
    {
      name: "paperpilot-auth-store",
    }
  )
);
