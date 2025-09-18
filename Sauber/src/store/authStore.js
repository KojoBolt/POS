// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      loading: true,
      darkMode: false,

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (value) => set({ darkMode: value }),

      init: () => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Fetch role from Firestore
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            set({
              user,
              role: docSnap.exists() ? docSnap.data().role : "cashier", // default fallback
              loading: false,
            });
          } else {
            set({ user: null, role: null, loading: false });
          }
        });
      },
    }),
    {
      name: "auth-storage",
  partialize: (state) => ({ user: state.user, role: state.role, darkMode: state.darkMode }),
    }
  )
);

export default useAuthStore;
