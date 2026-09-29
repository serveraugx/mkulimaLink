import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface UIState {
  toasts: Toast[];
  isSidebarCollapsed: boolean;
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
}

/**
 * Global UI state store for toasts and layout preferences.
 */
export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  isSidebarCollapsed: false,

  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    // Auto-remove after 4s
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
