// Sidebar Widget Exports - Clean Architecture
export { default as Sidebar } from "./ui/Sidebar"
export { useSidebar } from "./model/useSidebar"

// Component Exports - For reusability
export { SidebarHeader } from "./ui/SidebarHeader"
export { UserInfoCard } from "./ui/UserInfoCard"
export { NavList } from "./ui/NavList"
export { SecondaryActions } from "./ui/SecondaryActions"

// Icon & Utility Exports
export { MARITIME_ICONS, getMaritimeIcon } from "./ui/icons"

// Re-export types
export type { NavItem, UserInfo } from "./model/useSidebar"
export type { SidebarProps } from "./ui/Sidebar"
