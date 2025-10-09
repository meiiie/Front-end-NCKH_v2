/**
 * User Status Utilities for VMU Portal
 * Provides status colors and text for user information display
 */

export type UserStatus = "online" | "offline" | "busy"

/**
 * Get Tailwind CSS classes for user status indicator
 */
export const getUserStatusColor = (status: UserStatus): string => {
  switch (status) {
    case "online":
      return "bg-green-500"
    case "busy":
      return "bg-yellow-500"
    case "offline":
      return "bg-gray-400"
    default:
      return "bg-gray-400"
  }
}

/**
 * Get human-readable status text in Vietnamese
 */
export const getUserStatusText = (status: UserStatus): string => {
  switch (status) {
    case "online":
      return "Đang hoạt động"
    case "busy":
      return "Đang bận"
    case "offline":
      return "Không hoạt động"
    default:
      return "Không xác định"
  }
}

/**
 * Get status priority for sorting (higher number = higher priority)
 */
export const getUserStatusPriority = (status: UserStatus): number => {
  switch (status) {
    case "online":
      return 3
    case "busy":
      return 2
    case "offline":
      return 1
    default:
      return 0
  }
}
