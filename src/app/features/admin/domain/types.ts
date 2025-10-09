/**
 * Admin Domain Types
 * TypeScript types and enums for the Admin domain
 */

// ===== IDENTIFIERS =====
export type UserId = string & { readonly __brand: 'UserId' };
export type RoleId = string & { readonly __brand: 'RoleId' };

// ===== ENUMS =====
export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export enum UserAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  SUSPEND = 'suspend',
  ACTIVATE = 'activate',
  CHANGE_ROLE = 'change_role'
}

// ===== INTERFACES =====
export interface UserFilter {
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface UserSort {
  field: 'name' | 'email' | 'role' | 'status' | 'createdAt' | 'lastLogin';
  direction: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  number: number; // 0-based page number
}

export interface UserListResult {
  users: UserSummary[];
  pagination: PaginationInfo;
}

export interface UserSummary {
  id: UserId;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  studentId?: string;
  avatar?: string;
  lastLogin?: Date;
  createdAt: Date;
}

export interface UserDetails extends UserSummary {
  loginCount: number;
  coursesEnrolled: number;
  coursesCreated: number;
  totalSpent: number;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  department?: string;
  studentId?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  studentId?: string;
}

export interface BulkUserOperation {
  userIds: UserId[];
  action: UserAction;
  data?: any;
}

export interface BulkImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  result?: {
    importedUsers: UserSummary[];
    failedRows: number[];
  };
}

// ===== DOMAIN EVENTS =====
export interface UserCreatedEvent {
  userId: UserId;
  email: string;
  role: UserRole;
  timestamp: Date;
}

export interface UserUpdatedEvent {
  userId: UserId;
  changes: Partial<UpdateUserRequest>;
  timestamp: Date;
}

export interface UserDeletedEvent {
  userId: UserId;
  timestamp: Date;
}

export interface BulkOperationCompletedEvent {
  operationId: string;
  action: UserAction;
  affectedUsers: number;
  timestamp: Date;
}

// ===== UTILITY TYPES =====
export type UserRoleDisplay = {
  [K in UserRole]: string;
};

export type UserStatusDisplay = {
  [K in UserStatus]: string;
};

export const USER_ROLE_DISPLAY: UserRoleDisplay = {
  [UserRole.ADMIN]: 'Quản trị viên',
  [UserRole.TEACHER]: 'Giảng viên',
  [UserRole.STUDENT]: 'Học viên'
};

export const USER_STATUS_DISPLAY: UserStatusDisplay = {
  [UserStatus.ACTIVE]: 'Đang hoạt động',
  [UserStatus.INACTIVE]: 'Không hoạt động',
  [UserStatus.SUSPENDED]: 'Đã tạm khóa'
};