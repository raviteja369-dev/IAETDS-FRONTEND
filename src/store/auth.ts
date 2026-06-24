import { create } from "zustand";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  permissions: string[];
  hydrated: boolean;
  setAuth: (user: User, accessToken: string, permissions: string[]) => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setHydrated: (v: boolean) => void;
  clear: () => void;
  can: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  permissions: [],
  hydrated: false,
  setAuth: (user, accessToken, permissions) =>
    set({ user, accessToken, permissions }),
  setToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setHydrated: (hydrated) => set({ hydrated }),
  clear: () => set({ user: null, accessToken: null, permissions: [] }),
  can: (permission) => {
    const { permissions } = get();
    if (permissions.includes("*")) return true;
    if (permissions.includes(permission)) return true;
    const [resource] = permission.split(":");
    return permissions.includes(`${resource}:*`);
  },
}));
