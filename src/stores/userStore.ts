import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdminUser } from "../types";

interface AdminUserState {
  user: AdminUser | null;
  setUserInfo: (userObject: AdminUser) => void;
  removeUserInfo: () => void;
}

const userStore = (set: (state: Partial<AdminUserState>) => void): AdminUserState => {
  return {
    user: null,
    setUserInfo: (userObject: AdminUser) => {
      set({ user: userObject });
    },
    removeUserInfo: () => {
      set({ user: null });
    },
  };
};

const useUserStore = create(
  persist<AdminUserState>(userStore, { name: "user_info" })
);

export default useUserStore;