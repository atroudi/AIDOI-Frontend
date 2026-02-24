import { create } from "zustand";
import type { User } from "@/types";
import Cookies from "js-cookie";
import { isAdminRole } from "@/lib/utils";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,

  setAuth: (user: User, token: string) => {
    Cookies.set("aidoi_token", token, { expires: 7 });
    localStorage.setItem("aidoi_token", token);
    localStorage.setItem("aidoi_user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isAdmin: isAdminRole(user.role) });
  },

  clearAuth: () => {
    Cookies.remove("aidoi_token");
    localStorage.removeItem("aidoi_token");
    localStorage.removeItem("aidoi_user");
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
  },

  hydrate: () => {
    const token =
      Cookies.get("aidoi_token") || localStorage.getItem("aidoi_token");
    const userStr = localStorage.getItem("aidoi_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true, isAdmin: isAdminRole(user.role) });
      } catch {
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
      }
    }
  },
}));
