import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/services/api";

interface SavedState {
  savedIds: string[];
  isSyncing: boolean;
  toggleSaved: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  syncWithServer: () => Promise<void>;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      isSyncing: false,

      isSaved: (id: string) => get().savedIds.includes(id),

      toggleSaved: async (id: string) => {
        const already = get().savedIds.includes(id);

        // Optimistic update first so the UI responds instantly
        set((s) => ({
          savedIds: already
            ? s.savedIds.filter((x) => x !== id)
            : [...s.savedIds, id],
        }));

        try {
          const updated = already
            ? await api.unsaveProperty(id)
            : await api.saveProperty(id);
          set({ savedIds: updated });
        } catch {
          // Revert optimistic update if request failed
          set((s) => ({
            savedIds: already
              ? [...s.savedIds, id]
              : s.savedIds.filter((x) => x !== id),
          }));
        }
      },

      syncWithServer: async () => {
        set({ isSyncing: true });
        try {
          const ids = await api.getSavedPropertyIds();
          set({ savedIds: ids });
        } catch {
          // Keep local state as fallback if unauthenticated or offline
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    { name: "chainestate-saved" }
  )
);
