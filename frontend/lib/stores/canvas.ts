/** Raktio — Canvas store */
import { create } from "zustand";

interface CanvasStore {
  mode: string;
  setMode: (mode: string) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  mode: "feed",
  setMode: (mode) => set({ mode }),
}));
