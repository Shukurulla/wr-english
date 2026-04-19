"use client";
import { create } from "zustand";

let toastId = 0;

export const useToastStore = create((set) => ({
  toasts: [],

  addToast: (type, message, duration = 4000) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  }
}));

export const toast = {
  success: (msg) => useToastStore.getState().addToast("success", msg),
  error: (msg) => useToastStore.getState().addToast("error", msg, 8000),
  info: (msg) => useToastStore.getState().addToast("info", msg)
};
