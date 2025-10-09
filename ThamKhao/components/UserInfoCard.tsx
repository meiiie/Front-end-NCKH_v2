"use client"

/**
 * Professional User Information Card with Dropdown - Enhanced for VMU
 *
 * New Features:
 * - User dropdown menu for profile, settings, logout
 * - Cleaner, more spacious design
 * - Professional interactions and animations
 */

import type { FC } from "react"
import { useState, useRef, useEffect } from "react"
import type { UserInfo } from "../hooks/useSidebar"
import { getUserStatusColor, getUserStatusText } from "../entities/user/lib/utils"
import { getMaritimeIcon } from "./icons"

interface UserInfoCardProps {
  userInfo: UserInfo
  isCollapsed: boolean
}

export const UserInfoCard: FC<UserInfoCardProps> = ({ userInfo, isCollapsed }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      iconKey: "ship-wheel",
      action: () => console.log("Navigate to settings"),
    },
    {
      id: "logout",
      label: "Rời khỏi Cảng",
      description: "Đăng xuất khỏi hệ thống",
      iconKey: "log-out",
      action: () => console.log("Logout"),
      isDanger: true,
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  if (isCollapsed) {
    return (
      <div
        className="px-2 py-2 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 flex justify-center flex-shrink-0"
        ref={dropdownRef}
      >
        <div className="relative group">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-7 h-7 bg-gradient-to-br from-[#1A3BAD] to-[#3b82f6] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 border border-white"
          >
            {userInfo.avatar}
          </button>
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${getUserStatusColor(userInfo.status)} rounded-full border border-white shadow-sm`}
          ></div>

          {isDropdownOpen && (
            <div className="absolute left-full ml-3 mt-0 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[220px] overflow-hidden animate-in slide-in-from-left-2 duration-200 z-50">
              {/* Header */}
              <div className="px-3 py-2.5 bg-gradient-to-r from-[#1A3BAD] to-[#2563eb] text-white">
                <div className="font-semibold text-xs">{userInfo.name}</div>
                <div className="text-xs text-blue-100">{userInfo.studentId}</div>
              </div>

              {/* Menu Items */}
              <div className="py-1.5">
                {userMenuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action()
                      setIsDropdownOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all duration-200
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
                      w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${item.isDanger ? "bg-red-100 text-red-600" : "bg-gray-100 text-[#1A3BAD]"}
                    `}
                    >
                      {getMaritimeIcon(item.iconKey)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">{item.label}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hover Tooltip - only show when dropdown is closed */}
          {!isDropdownOpen && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-40 shadow-xl border border-gray-700">
              <div className="font-semibold text-xs">{userInfo.name}</div>
              <div className="text-xs text-gray-300">{userInfo.studentId}</div>
              <div className="text-xs text-blue-200">{userInfo.faculty}</div>
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="px-3 py-2.5 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 flex-shrink-0"
      ref={dropdownRef}
    >
      {/* Section Header - Compact */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 bg-[#1A3BAD] rounded-full"></div>
        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Sinh viên</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#1A3BAD]/30 to-transparent"></div>
      </div>

      <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center gap-2.5 text-left group"
        >
          {/* Compact Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-[#1A3BAD] to-[#3b82f6] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md border border-blue-100 group-hover:shadow-lg transition-all duration-300">
              {userInfo.avatar}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${getUserStatusColor(userInfo.status)} rounded-full border border-white shadow-sm`}
            ></div>
          </div>

          {/* Compact Student Information */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xs text-gray-900 truncate mb-0.5 group-hover:text-[#1A3BAD] transition-colors">
              {userInfo.name}
            </h3>
            <p className="text-xs text-gray-600 truncate font-medium mb-0.5">{userInfo.studentId}</p>
            <p className="text-xs text-[#1A3BAD] font-medium truncate mb-1.5">{userInfo.faculty}</p>

            {/* Compact Status Display */}
            <div className="flex items-center gap-1.5 p-1.5 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-md border border-gray-100">
              <div className={`w-1.5 h-1.5 ${getUserStatusColor(userInfo.status)} rounded-full`}></div>
              <span className="text-xs text-gray-700 font-medium flex-1 truncate">
                {getUserStatusText(userInfo.status)}
              </span>
            </div>
          </div>

          <div
            className={`
            text-gray-400 transition-transform duration-300 flex-shrink-0
            ${isDropdownOpen ? "rotate-180 text-[#1A3BAD]" : "group-hover:text-[#1A3BAD]"}
          `}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute left-2.5 right-2.5 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
            {/* Header */}
            <div className="px-3 py-2.5 bg-gradient-to-r from-[#1A3BAD] to-[#2563eb] text-white">
              <div className="font-semibold text-xs">{userInfo.name}</div>
              <div className="text-xs text-blue-100">Menu cá nhân</div>
            </div>

            {/* Menu Items */}
            <div className="py-1.5">
              {userMenuItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action()
                    setIsDropdownOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all duration-200
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
                      w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${item.isDanger ? "bg-red-100 text-red-600" : "bg-gray-100 text-[#1A3BAD]"}
                    `}
                  >
                    {getMaritimeIcon(item.iconKey)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{item.label}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
