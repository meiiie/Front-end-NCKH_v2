import { UserId, UserRole, UserStatus } from '../types';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';

/**
 * Domain Entity: User
 * Represents a user in the admin domain with business logic
 * Immutable entity with validation and business rules
 */
export class User {
  constructor(
    public readonly id: UserId,
    public readonly email: Email,
    public readonly password: Password,
    public readonly fullName: string,
    public readonly role: UserRole,
    public readonly status: UserStatus,
    public readonly department?: string,
    public readonly studentId?: string,
    public readonly metadata: UserMetadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      loginCount: 0,
      coursesEnrolled: 0,
      coursesCreated: 0,
      totalSpent: 0
    }
  ) {
    const validation = this.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid user: ${validation.errors.join(', ')}`);
    }
  }

  /**
   * Business Logic Methods
   */

  /**
   * Check if user is active
   */
  public isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  /**
   * Check if user is admin
   */
  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Check if user is teacher
   */
  public isTeacher(): boolean {
    return this.role === UserRole.TEACHER;
  }

  /**
   * Check if user is student
   */
  public isStudent(): boolean {
    return this.role === UserRole.STUDENT;
  }

  /**
   * Check if user can be deleted (business rule)
   */
  public canBeDeleted(): boolean {
    // Admin users cannot be deleted
    if (this.isAdmin()) return false;

    // Teachers with courses cannot be deleted
    if (this.isTeacher() && this.metadata.coursesCreated > 0) return false;

    // Students with enrolled courses cannot be deleted
    if (this.isStudent() && this.metadata.coursesEnrolled > 0) return false;

    return true;
  }

  /**
   * Check if user can change role (business rule)
   */
  public canChangeRole(newRole: UserRole): boolean {
    // Cannot change admin role
    if (this.isAdmin()) return false;

    // Teachers with courses cannot become students
    if (this.isTeacher() && this.metadata.coursesCreated > 0 && newRole === UserRole.STUDENT) {
      return false;
    }

    return true;
  }

  /**
   * Get user display name
   */
  public getDisplayName(): string {
    return this.fullName || this.email.value;
  }

  /**
   * Get role display name
   */
  public getRoleDisplayName(): string {
    switch (this.role) {
      case UserRole.ADMIN: return 'Quản trị viên';
      case UserRole.TEACHER: return 'Giảng viên';
      case UserRole.STUDENT: return 'Học viên';
      default: return 'Không xác định';
    }
  }

  /**
   * Get status display name
   */
  public getStatusDisplayName(): string {
    switch (this.status) {
      case UserStatus.ACTIVE: return 'Đang hoạt động';
      case UserStatus.INACTIVE: return 'Không hoạt động';
      case UserStatus.SUSPENDED: return 'Đã tạm khóa';
      default: return 'Không xác định';
    }
  }

  /**
   * Validate user data
   */
  public validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.fullName || this.fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    if (this.role === UserRole.STUDENT && !this.studentId) {
      warnings.push('Students should have a student ID');
    }

    if (this.isTeacher() && !this.department) {
      warnings.push('Teachers should have a department');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Create a copy with updated status
   */
  public withStatus(newStatus: UserStatus): User {
    return new User(
      this.id,
      this.email,
      this.password,
      this.fullName,
      this.role,
      newStatus,
      this.department,
      this.studentId,
      {
        ...this.metadata,
        updatedAt: new Date()
      }
    );
  }

  /**
   * Create a copy with updated role
   */
  public withRole(newRole: UserRole): User {
    return new User(
      this.id,
      this.email,
      this.password,
      this.fullName,
      newRole,
      this.status,
      this.department,
      this.studentId,
      {
        ...this.metadata,
        updatedAt: new Date()
      }
    );
  }

  /**
   * Create a copy with updated metadata
   */
  public withUpdatedMetadata(updates: Partial<UserMetadata>): User {
    return new User(
      this.id,
      this.email,
      this.password,
      this.fullName,
      this.role,
      this.status,
      this.department,
      this.studentId,
      {
        ...this.metadata,
        ...updates,
        updatedAt: new Date()
      }
    );
  }
}

/**
 * User Metadata
 */
export interface UserMetadata {
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  loginCount: number;
  coursesEnrolled: number;
  coursesCreated: number;
  totalSpent: number;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}