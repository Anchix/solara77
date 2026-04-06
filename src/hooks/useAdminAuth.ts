import { create } from "zustand";

interface AdminAuthState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const ADMIN_PASSWORD = "solura2024";

export const useAdminAuth = create<AdminAuthState>((set) => ({
  isAuthenticated: sessionStorage.getItem("solura_admin") === "true",
  login: (password: string) => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("solura_admin", "true");
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => {
    sessionStorage.removeItem("solura_admin");
    set({ isAuthenticated: false });
  },
}));
