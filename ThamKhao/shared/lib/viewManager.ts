"use client"

/**
 * View Manager for VMU Student Portal
 * Manages navigation state and view transitions
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type StudentView = "dashboard" | "quizzes" | "history" | "profile" | "settings" | "logout"

interface ViewState {
  currentView: StudentView
  setView: (view: StudentView) => void
  previousView: StudentView | null
}

export const useView = create<ViewState>()(
  persist(
    (set, get) => ({
      currentView: "dashboard",
      previousView: null,
      setView: (view: StudentView) => {
        const current = get().currentView
        set({
          currentView: view,
          previousView: current,
        })

        // Emit navigation event for host application
        window.dispatchEvent(
          new CustomEvent("vmu:navigation:change", {
            detail: {
              from: current,
              to: view,
              timestamp: Date.now(),
            },
          }),
        )
      },
    }),
    {
      name: "vmu-view-state",
      partialize: (state) => ({ currentView: state.currentView }),
    },
  ),
)
