"use client";
import { create } from "zustand";
import api from "@/lib/api-client";

let initPromise = null;

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,

  // #4: init bir marta chaqiriladi, qayta chaqirsangiz cache'dan
  init: () => {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        set({ isLoading: false });
        return;
      }
      try {
        const res = await api.get("/auth/me");
        set({ user: res.data, isLoading: false });
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, isLoading: false });
      }
    })();
    return initPromise;
  },

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user } = res.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ user });
    initPromise = null; // login'dan keyin yangi init kerak bo'lishi mumkin
    return user;
  },

  logout: () => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null });
    initPromise = null;
  }
}));
