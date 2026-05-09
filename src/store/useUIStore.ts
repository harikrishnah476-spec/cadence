import { create } from 'zustand';

export type ViewState = 'practice' | 'analytics' | 'settings';

interface UIState {
  currentView: ViewState;
  isSidebarOpen: boolean;
  setView: (view: ViewState) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'practice',
  isSidebarOpen: true, // Default to true on larger screens, handled via CSS
  setView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
