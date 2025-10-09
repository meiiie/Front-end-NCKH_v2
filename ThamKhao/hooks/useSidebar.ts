"use client"

/**
 * Sidebar Model - Student MFE
 *
 * Triết lý: "La Bàn Số" - Maritime Navigation System
 * Design Vision: Professional Maritime Interface for Vietnam Maritime University
 * Color Scheme: Navy Blue (#1A3BAD) + Compass Gold (#FFC107)
 */

import { useMemo } from "react"
import type { StudentView } from "../shared/lib/viewManager"

export interface NavItem {
  id: StudentView
  label: string
  iconKey: string
  description?: string
  badge?: string // Optional badge for special items
}

export interface SecondaryAction {
  id: string
  label: string
  iconKey: string
  description?: string
  onClick?: () => void
}

export interface UserInfo {
  name: string
  studentId: string
  faculty: string
  avatar: string
  status: "online" | "offline" | "busy"
}

export const useSidebar = () => {
  // Maritime Navigation Items với thiết kế chuyên nghiệp
  const navItems: NavItem[] = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Bảng Điều Khiển",
        description: "Tổng quan hoạt động",
        iconKey: "anchor", // Maritime anchor symbol
      },
      {
        id: "quizzes",
        label: "Khám Phá Kiến Thức",
        description: "Bài kiểm tra khả dụng",
        iconKey: "list",
        badge: "new", // Indicate new quizzes available
      },
      {
        id: "history",
        label: "Nhật Ký Hành Trình",
        description: "Lịch sử học tập",
        iconKey: "history",
      },
    ],
    [],
  )

  // Secondary Actions - Bottom of sidebar
  const secondaryActions: SecondaryAction[] = useMemo(
    () => [
      // Empty array - all actions moved to user dropdown for cleaner design
    ],
    [],
  )

  // Mock user data - In real app, this would come from auth context
  const userInfo: UserInfo = useMemo(
    () => ({
      name: "Nguyễn Văn Hải",
      studentId: "SV2024001",
      faculty: "Khoa Hàng Hải",
      avatar: "NH", // Initials for avatar
      status: "online",
    }),
    [],
  )

  return {
    navItems,
    secondaryActions,
    userInfo,
  }
}
