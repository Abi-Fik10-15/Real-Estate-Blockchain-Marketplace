import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { getStoredToken } from "@/lib/api";
import { api } from "@/services/api";

interface SavedState {
  savedIds: string[];
  isSyncing: boolean;
  toggleSaved: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  syncWithServer: () => Promise<void>;
}

/** Prevents a slow initial sync from overwriting a newer toggle result. */
let syncGeneration = 0;

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      isSyncing: false,

      isSaved: (id: string) => get().savedIds.includes(id),

      toggleSaved: async (id: string) => {
        if (!id) {
          toast.error("Cannot save this listing (missing property id).");
          return;
        }

        if (!getStoredToken()) {
          toast.error("Sign in to save properties.");
          return;
        }

        const already = get().savedIds.includes(id);
        const generation = ++syncGeneration;

        set((s) => ({
          savedIds: already
            ? s.savedIds.filter((x) => x !== id)
            : [...s.savedIds, id],
        }));

        try {
          const updated = already
            ? await api.unsaveProperty(id)
            : await api.saveProperty(id);

          if (generation === syncGeneration) {
            set({ savedIds: updated });
          }
        } catch {
          if (generation !== syncGeneration) return;

          set((s) => ({
            savedIds: already
              ? [...s.savedIds, id]
              : s.savedIds.filter((x) => x !== id),
          }));
          toast.error("Could not update saved properties. Please try again.");
        }
      },

      syncWithServer: async () => {
        if (!getStoredToken()) return;

        const generation = ++syncGeneration;
        set({ isSyncing: true });

        try {
          const ids = await api.getSavedPropertyIds();
          if (generation === syncGeneration) {
            set({ savedIds: ids });
          }
        } catch {
          // Keep local state as fallback if unauthenticated or offline
        } finally {
          if (generation === syncGeneration) {
            set({ isSyncing: false });
          }
        }
      },
    }),
    {
      name: "chainestate-saved",
      partialize: (state) => ({ savedIds: state.savedIds }),
    }
  )
);
