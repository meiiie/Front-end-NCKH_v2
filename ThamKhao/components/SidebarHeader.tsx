"use client"

/**
 * Professional VMU Sidebar Header
 *
 * Enhanced with:
 * - Refined toggle button with micro-interactions
 * - Professional university branding
 * - Smooth animations and transitions
 * - Maritime-inspired design elements
 */

import type { FC } from "react"
import { getMaritimeIcon } from "./icons"

interface SidebarHeaderProps {
  isCollapsed: boolean
  onToggle: () => void
  isTransitioning?: boolean
}

export const SidebarHeader: FC<SidebarHeaderProps> = ({ isCollapsed, onToggle, isTransitioning = false }) => {
  return (
    <header
      className={`
      flex-shrink-0 bg-gradient-to-br from-[#1A3BAD] via-[#2563eb] to-[#1A3BAD] text-white relative overflow-hidden
      transition-all duration-500 ease-in-out
      ${isCollapsed ? "px-2 py-3" : "px-3 py-4"}
    `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFC107]/10 to-transparent"></div>
      <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFC107]/10 rounded-full -translate-y-8 translate-x-8"></div>

      <div className="relative z-10 flex items-center justify-between">
        {/* VMU Logo & Branding */}
        <div
          className={`flex items-center transition-all duration-500 ${isCollapsed ? "justify-center w-full" : "gap-2"}`}
        >
          <div
            className={`
            bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center 
            shadow-md border border-white/20 transition-all duration-500 group hover:bg-white/20
            ${isCollapsed ? "w-8 h-8" : "w-10 h-10"}
          `}
          >
            <div className="text-white group-hover:scale-110 transition-transform duration-300 text-sm">
              {getMaritimeIcon("university")}
            </div>
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0 transition-all duration-500">
              <h1 className="text-base font-bold tracking-tight truncate mb-0.5">
                <span className="text-white">VMU </span>
                <span className="text-[#FFC107]">Portal</span>
              </h1>
              <p className="text-xs text-blue-100/90 truncate font-medium tracking-wide">Hệ thống quản lý sinh viên</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-2 h-px bg-gradient-to-r from-transparent via-[#FFC107]/60 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
      </div>
    </header>
  )
}
