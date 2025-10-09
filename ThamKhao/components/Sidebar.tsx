"use client"

/**
 * Professional VMU Sidebar - Redesigned by UX/UI Expert
 *
 * Design Philosophy: "Maritime Excellence Interface"
 * - Clean, professional layout with clear visual hierarchy
 * - Enhanced spacing and typography for better readability
 * - Sophisticated color system with maritime-inspired palette
 * - Professional-grade interactions and animations
 *
 * Key Improvements:
 * - Larger, more prominent navigation items
 * - Refined toggle mechanism with smooth animations
 * - Clear section divisions using subtle visual cues
 * - Professional LED accent border
 * - Optimized spacing and layout proportions
 */

import type { FC } from "react"
import { useState, useEffect } from "react"
import { useView } from "../shared/lib/viewManager"
import { useSidebar } from "../hooks/useSidebar"
import { SidebarHeader } from "./SidebarHeader"
import { UserInfoCard } from "./UserInfoCard"
import { NavList } from "./NavList"

export interface SidebarProps {
  className?: string
}

/**
 * Get initial collapsed state from localStorage with SSR safety
 */
const getInitialCollapsedState = (): boolean => {
  if (typeof window === "undefined") return false
  const savedState = localStorage.getItem("vmu-sidebar-collapsed")
  return savedState ? JSON.parse(savedState) : false
}

export const Sidebar: FC<SidebarProps> = ({ className = "" }) => {
  const { currentView, setView } = useView()
  const { navItems, secondaryActions, userInfo } = useSidebar()

  // Enhanced state management with smooth transitions
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Professional toggle handler with transition management
  const handleToggle = () => {
    setIsTransitioning(true)
    const newCollapsedState = !isCollapsed

    // Smooth transition timing
    setTimeout(() => {
      setIsCollapsed(newCollapsedState)
      localStorage.setItem("vmu-sidebar-collapsed", JSON.stringify(newCollapsedState))

      // Notify host application
      window.dispatchEvent(
        new CustomEvent("vmu:sidebar:toggle", {
          detail: { isCollapsed: newCollapsedState },
        }),
      )

      setTimeout(() => setIsTransitioning(false), 150)
    }, 50)
  }

  // Initial state notification
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("vmu:sidebar:toggle", {
        detail: { isCollapsed },
      }),
    )
  }, [])

  return (
    <>
      <button
        onClick={handleToggle}
        className={`
          fixed top-6 z-50 
          w-6 h-10 bg-gradient-to-b from-[#1A3BAD] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1A3BAD]
          text-white rounded-r-lg shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-all duration-500 ease-in-out
          border border-l-0 border-[#FFC107]/30 hover:border-[#FFC107]/60
          ${isCollapsed ? "left-16" : "left-64"}
        `}
        title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
      >
        <div className={`transition-transform duration-500 ease-in-out ${isCollapsed ? "rotate-0" : "rotate-180"}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
      </button>

      <aside
        className={`
        relative h-full bg-white flex flex-col shadow-2xl transition-all duration-500 ease-in-out
        ${isCollapsed ? "w-16 min-w-[4rem] max-w-[4rem]" : "w-64 min-w-[16rem] max-w-[16rem]"}
        ${isTransitioning ? "pointer-events-none" : ""}
        ${className}
      `}
      >
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1A3BAD] via-[#FFC107] to-[#1A3BAD] shadow-lg shadow-[#1A3BAD]/30 z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-pulse"></div>
        </div>

        {/* VMU Maritime Header - Compact */}
        <SidebarHeader isCollapsed={isCollapsed} onToggle={handleToggle} isTransitioning={isTransitioning} />

        {/* User Information Section - Compact */}
        <UserInfoCard userInfo={userInfo} isCollapsed={isCollapsed} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-[#1A3BAD]/50">
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "px-2 py-2" : "px-4 py-2"}`}>
            {!isCollapsed ? (
              <>
                <div className="w-1.5 h-1.5 bg-[#1A3BAD] rounded-full"></div>
                <div className="flex-1 h-px bg-gradient-to-r from-[#1A3BAD]/30 via-gray-300 to-transparent ml-2"></div>
              </>
            ) : (
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1A3BAD]/50 to-transparent"></div>
            )}
          </div>

          {/* Main Navigation - Enhanced Design */}
          <NavList navItems={navItems} currentView={currentView} onViewChange={setView} isCollapsed={isCollapsed} />
        </div>

        {/* Bottom Section Divider */}
        <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "px-2 py-2" : "px-4 py-2"}`}>
          {!isCollapsed ? (
            <>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-[#1A3BAD]/30 mr-2"></div>
              <div className="w-1.5 h-1.5 bg-[#1A3BAD] rounded-full"></div>
            </>
          ) : (
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1A3BAD]/50 to-transparent"></div>
          )}
        </div>

        {/* Clean Footer - Single Version */}
        <footer
          className={`flex-shrink-0 bg-gradient-to-r from-[#1A3BAD]/5 to-[#FFC107]/5 border-t border-gray-200/50 transition-all duration-300 ${isCollapsed ? "px-2 py-2" : "px-4 py-3"}`}
        >
          {!isCollapsed && (
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium">© 2025 VMU Portal</p>
              <p className="text-xs text-gray-400 mt-0.5">Trường ĐH Hàng hải Việt Nam</p>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-[#1A3BAD] rounded-full opacity-60"></div>
            </div>
          )}
        </footer>

        <div className="h-1 bg-gradient-to-r from-[#1A3BAD] via-[#FFC107] to-[#1A3BAD] shadow-inner"></div>
      </aside>
    </>
  )
}

export default Sidebar
