import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type User = {
  username: string;
  email: string;
  created_at: string;
};

interface AuthState {
  token: string | null;
  user: User | null;
  __hasHydrated: boolean;
  __setHasHydrated: (__hasHydrated: boolean) => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      user: null,
      __hasHydrated: false,
      __setHasHydrated: __hasHydrated => set({ __hasHydrated }),
      setToken: token => set({ token }),
      setUser: user => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        state?.__setHasHydrated(true);
      },
    },
  ),
);
