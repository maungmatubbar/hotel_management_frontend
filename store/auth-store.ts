import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserDataResponse } from "@/generated/generated";

type LoginMethod = "password" | "otp";

type AuthStore = {
  loginMethod: LoginMethod;
  identifier: string;
  token: string | null;
  user: UserDataResponse | null;
  profilePhoto: string | null;
  setLoginMethod: (method: LoginMethod) => void;
  setIdentifier: (identifier: string) => void;
  setSession: (session: { token: string; user: UserDataResponse }) => void;
  setUser: (user: UserDataResponse) => void;
  setProfilePhoto: (photo: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      loginMethod: "password",
      identifier: "",
      token: null,
      user: null,
      profilePhoto: null,
      setLoginMethod: (method) => set({ loginMethod: method }),
      setIdentifier: (identifier) => set({ identifier }),
      setSession: (session) => set({ token: session.token, user: session.user }),
      setUser: (user) => set({ user }),
      setProfilePhoto: (profilePhoto) => set({ profilePhoto }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "hotelos-auth",
      skipHydration: true,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        profilePhoto: state.profilePhoto,
        loginMethod: state.loginMethod,
        identifier: state.identifier,
      }),
    }
  )
);
