"use client"

/**
 * Professional Secondary Actions & Footer
 *
 * Enhanced with:
 * - Better visual separation
 * - Professional styling
 * - Improved spacing and layout
 */

import type { FC } from "react"
import type { SecondaryAction } from "../hooks/useSidebar"
import { getMaritimeIcon } from "./icons"

interface SecondaryActionsProps {
  secondaryActions: SecondaryAction[]
  isCollapsed: boolean
}

export const SecondaryActions: FC<SecondaryActionsProps> = ({ secondaryActions, isCollapsed }) => {
  return (
    <div
      className={`flex-shrink-0 bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 transition-all duration-300 ${
        isCollapsed ? "px-2 py-4" : "px-4 py-6"
      }`}
    >
      {/* Secondary Actions */}
      <div className={`space-y-2 mb-4 ${isCollapsed ? "space-y-3" : ""}`}>
        {secondaryActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            title={isCollapsed ? action.label : undefined}
            className={`
              group relative w-full flex items-center text-left transition-all duration-300 
              hover:scale-[1.02] active:scale-[0.98] rounded-xl
              ${isCollapsed ? "justify-center px-2 py-3 h-12" : "gap-3 px-4 py-3 h-14"}
              text-gray-600 hover:bg-gray-100 hover:text-[#1e40af] hover:shadow-md border border-transparent hover:border-gray-200
            `.trim()}
          >
            {/* Icon */}
            <div
              className={`
              flex items-center justify-center rounded-xl transition-all duration-300 flex-shrink-0
              ${isCollapsed ? "w-8 h-8" : "w-10 h-10"}
              bg-gray-100 group-hover:bg-[#1e40af] group-hover:text-white
            `}
            >
              {getMaritimeIcon(action.iconKey)}
            </div>

            {/* Label */}
            {!isCollapsed && <span className="font-medium text-sm truncate">{action.label}</span>}

            {/* Tooltip for collapsed mode */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                {action.label}
                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Professional Footer */}
      <div className={`border-t border-gray-200 pt-4 transition-all duration-300 ${isCollapsed ? "text-center" : ""}`}>
        {!isCollapsed ? (
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">Trường Đại học Hàng hải Việt Nam</p>
            <p className="text-xs text-gray-400">© 2024 VMU Portal v2.0</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1e40af] to-[#3b82f6] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">
              VMU
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
