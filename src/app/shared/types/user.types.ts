export interface User {
  id: string;           // Changed from number to string (UUID)
  username: string;     // Added - required by backend
  email: string;
  fullName: string;     // Changed from name to match backend
  role: UserRole;
  enabled: boolean;     // Added - account status from backend
  avatar?: string;      // Keep for UI - not sent to backend
  department?: string;  // Keep for UI - not sent to backend
  studentId?: string;   // Keep for UI - not sent to backend
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export interface LoginRequest {
  username: string;     // Changed from email to match backend
  password: string;
}

export interface RegisterRequest {
  username: string;     // Added - required by backend
  email: string;
  password: string;
  fullName: string;     // Changed from name to match backend
  role?: UserRole;      // Made optional - backend has default STUDENT
}