"use client"

import { useState, useRef, useEffect } from "react"
import type { FC } from "react"
import { getMaritimeIcon } from "./icons"

interface UserDropdownProps {
  isCollapsed: boolean
  userName: string
  userRole: string
  userAvatar?: string
}

export const UserDropdown: FC<UserDropdownProps> = ({ isCollapsed, userName, userRole, userAvatar }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const userMenuItems = [
    {
      id: "profile",
      label: "Hồ sơ thủy thủ",
      description: "Quản lý thông tin cá nhân",
      iconKey: "user",
      action: () => console.log("Navigate to profile"),
    },
    {
      id: "settings",
      label: "Cài đặt hệ thống",
      description: "Tùy chỉnh ứng dụng",
      iconKey: "settings",
      action: () => console.log("Navigate to settings"),
    },
    {
      id: "logout",
      label: "Rời khỏi Cảng",
      description: "Đăng xuất khỏi hệ thống",
      iconKey: "logout",
      action: () => console.log("Logout"),
      isDanger: true,
    },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Info Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300
          hover:bg-gradient-to-r hover:from-[#1A3BAD]/5 hover:to-[#FFC107]/5
          hover:shadow-md hover:shadow-gray-200/50 border border-transparent
          hover:border-[#1A3BAD]/20 group
          ${isCollapsed ? "justify-center" : ""}
          ${isOpen ? "bg-gradient-to-r from-[#1A3BAD]/10 to-[#FFC107]/10 shadow-md" : ""}
        `}
      >
        {/* Avatar */}
        <div
          className={`
          relative flex-shrink-0 rounded-full overflow-hidden border-2 transition-all duration-300
          ${isCollapsed ? "w-8 h-8" : "w-10 h-10"}
          ${isOpen ? "border-[#FFC107] shadow-lg" : "border-gray-200 group-hover:border-[#1A3BAD]/30"}
        `}
        >
          {userAvatar ? (
            <img src={userAvatar || "/placeholder.svg"} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1A3BAD] to-[#2563eb] flex items-center justify-center text-white font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Online Status Indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="flex-1 text-left min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">{userName}</div>
            <div className="text-xs text-gray-500 truncate">{userRole}</div>
          </div>
        )}

        {/* Dropdown Arrow */}
        {!isCollapsed && (
          <div
            className={`
            text-gray-400 transition-transform duration-300 flex-shrink-0
            ${isOpen ? "rotate-180 text-[#1A3BAD]" : "group-hover:text-[#1A3BAD]"}
          `}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
          absolute z-50 mt-2 bg-white rounded-xl shadow-xl border border-gray-200
          min-w-[240px] overflow-hidden animate-in slide-in-from-top-2 duration-200
          ${isCollapsed ? "left-full ml-3" : "left-0 right-0"}
        `}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#1A3BAD] to-[#2563eb] text-white">
            <div className="font-semibold text-sm">{userName}</div>
            <div className="text-xs text-blue-100">{userRole}</div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {userMenuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action()
                  setIsOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200
                  hover:bg-gradient-to-r hover:shadow-sm
                  ${
                    item.isDanger
                      ? "hover:from-red-50 hover:to-red-100 text-red-600 hover:text-red-700"
                      : "hover:from-[#1A3BAD]/5 hover:to-[#FFC107]/5 text-gray-700 hover:text-[#1A3BAD]"
                  }
                  ${index < userMenuItems.length - 1 ? "border-b border-gray-100" : ""}
                `}
              >
                <div
                  className={`
                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200
                  ${item.isDanger ? "bg-red-100 text-red-600" : "bg-gray-100 text-[#1A3BAD]"}
                `}
                >
                  {getMaritimeIcon(item.iconKey)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.label}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collapsed Mode Tooltip */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-[#1A3BAD] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-40 shadow-xl">
          <div className="font-semibold">{userName}</div>
          <div className="text-blue-100">{userRole}</div>
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-[#1A3BAD]"></div>
        </div>
      )}
    </div>
  )
}
