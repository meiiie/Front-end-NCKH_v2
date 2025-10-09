"use client"

/**
 * Professional Navigation List - Redesigned for VMU
 *
 * Key Improvements:
 * - Larger, more prominent navigation items (18px height minimum)
 * - Enhanced visual hierarchy with better spacing
 * - Professional hover states and active indicators
 * - Smooth animations and micro-interactions
 * - Clear section organization
 */

import type { FC } from "react"
import type { StudentView } from "../shared/lib/viewManager"
import type { NavItem } from "../hooks/useSidebar"
import { getMaritimeIcon } from "./icons"

interface NavListProps {
  navItems: NavItem[]
  currentView: StudentView
  onViewChange: (view: StudentView) => void
  isCollapsed: boolean
}

export const NavList: FC<NavListProps> = ({ navItems, currentView, onViewChange, isCollapsed }) => {
  return (
    <nav className={`flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? "px-1 py-3" : "px-3 py-4"}`}>
      {/* Section Title - Professional */}
      {!isCollapsed && (
        <div className="mb-4 px-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chức năng chính</h3>
        </div>
      )}

      {/* Navigation Items - Enhanced Design */}
      <div className={`space-y-1 ${isCollapsed ? "space-y-2" : ""}`}>
        {navItems.map((item) => {
          const isActive = currentView === item.id

          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => onViewChange(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`
                  group relative w-full flex items-center text-left transition-all duration-300 
                  transform hover:scale-[1.01] active:scale-[0.99] rounded-xl overflow-hidden
                  ${isCollapsed ? "justify-center px-1 py-3 h-12" : "gap-3 px-3 py-3 h-14"}
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[#1A3BAD] to-[#2563eb] text-white shadow-lg shadow-[#1A3BAD]/25 border border-[#FFC107]/30"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#1A3BAD]/5 hover:shadow-md hover:shadow-gray-200/50 border border-transparent hover:border-[#1A3BAD]/20"
                  }
                `.trim()}
              >
                {/* Active Side Indicator - Enhanced */}
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-10 bg-[#FFC107] rounded-r-full shadow-lg"></div>
                )}

                {/* Icon Container - Larger and more prominent */}
                <div
                  className={`
                  relative z-10 flex items-center justify-center rounded-lg transition-all duration-300 flex-shrink-0
                  ${isCollapsed ? "w-8 h-8" : "w-10 h-10"}
                  ${
                    isActive
                      ? "bg-white/20 text-white shadow-md backdrop-blur-sm border border-white/30"
                      : "bg-gradient-to-br from-gray-100 to-gray-50 text-[#1A3BAD] group-hover:bg-gradient-to-br group-hover:from-[#1A3BAD] group-hover:to-[#2563eb] group-hover:text-white group-hover:shadow-md border border-gray-200 group-hover:border-[#FFC107]/30"
                  }
                `}
                >
                  <div
                    className={`transition-all duration-300 text-sm ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                  >
                    {getMaritimeIcon(item.iconKey)}
                  </div>

                  {/* Badge for special items - Enhanced */}
                  {item.badge === "new" && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-[#FFC107] to-orange-500 rounded-full border border-white animate-bounce flex items-center justify-center shadow-md">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Label & Description - Larger and more readable */}
                {!isCollapsed && (
                  <div className="relative z-10 flex-1 min-w-0">
                    <div
                      className={`
                      font-semibold text-sm leading-tight transition-colors duration-300 truncate mb-0.5
                      ${isActive ? "text-white" : "text-gray-900 group-hover:text-[#1A3BAD]"}
                    `}
                    >
                      {item.label}
                    </div>
                    {item.description && (
                      <div
                        className={`
                        text-xs transition-colors duration-300 truncate
                        ${isActive ? "text-blue-100" : "text-gray-500 group-hover:text-gray-600"}
                      `}
                      >
                        {item.description}
                      </div>
                    )}
                  </div>
                )}

                {/* Active Arrow Indicator - Enhanced */}
                {isActive && !isCollapsed && (
                  <div className="text-[#FFC107] flex-shrink-0 animate-pulse">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                {/* Professional Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-[#1A3BAD] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-[#FFC107]/30">
                    <div className="font-semibold text-sm">{item.label}</div>
                    {item.description && <div className="text-xs text-blue-100 mt-0.5">{item.description}</div>}
                    {/* Enhanced Tooltip Arrow */}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-[#1A3BAD]"></div>
                  </div>
                )}

                {/* Subtle background animation */}
                <div
                  className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC107]/10 to-transparent 
                  transform translate-x-full group-hover:translate-x-0 transition-transform duration-700
                  ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
                ></div>
              </button>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
