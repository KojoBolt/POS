// src/store/authStore.js
import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const useAuthStore = create((set) => ({
  user: null,
  role: null,
  loading: true,

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
}));

export default useAuthStore;
