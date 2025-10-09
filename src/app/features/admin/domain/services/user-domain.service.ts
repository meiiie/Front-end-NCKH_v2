import { inject, Injectable, InjectionToken } from '@angular/core';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email';
import { Password } from '../value-objects/password';
import { UserId, UserRole, UserStatus, CreateUserRequest, UpdateUserRequest } from '../types';

// Injection token for UserRepository
export const USER_REPOSITORY = new InjectionToken<UserRepository>('UserRepository');

/**
 * Domain Service: User Domain Service
 * Contains business logic that doesn't belong to any specific entity
 */
@Injectable({
  providedIn: 'root'
})
export class UserDomainService {
  private userRepository = inject(USER_REPOSITORY);

  /**
   * Validate user creation request
   */
  async validateUserCreation(request: CreateUserRequest): Promise<void> {
    // Check if email already exists
    const emailExists = await this.userRepository.existsByEmail(request.email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // Validate email format
    Email.create(request.email);

    // Validate password strength
    Password.create(request.password);

    // Business rules for different roles
    if (request.role === UserRole.STUDENT && !request.studentId) {
      throw new Error('Student ID is required for student accounts');
    }

    if (request.role === UserRole.TEACHER && !request.department) {
      throw new Error('Department is required for teacher accounts');
    }
  }

  /**
   * Validate user update request
   */
  async validateUserUpdate(userId: UserId, request: UpdateUserRequest): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check role change permissions
    if (request.role && !user.canChangeRole(request.role)) {
      throw new Error('Cannot change role for this user');
    }

    // Validate email if provided
    if (request.role === UserRole.STUDENT && !request.studentId) {
      throw new Error('Student ID is required for student accounts');
    }

    if (request.role === UserRole.TEACHER && !request.department) {
      throw new Error('Department is required for teacher accounts');
    }
  }

  /**
   * Check if user can be deleted
   */
  async canDeleteUser(userId: UserId): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return user ? user.canBeDeleted() : false;
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    teachers: number;
    students: number;
    admins: number;
  }> {
    const [totalUsers, activeUsers, teachers, students, admins] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.countByStatus(UserStatus.ACTIVE),
      this.userRepository.countByRole(UserRole.TEACHER),
      this.userRepository.countByRole(UserRole.STUDENT),
      this.userRepository.countByRole(UserRole.ADMIN)
    ]);

    return {
      totalUsers,
      activeUsers,
      teachers,
      students,
      admins
    };
  }

  /**
   * Generate unique student ID
   */
  generateStudentId(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `STU${timestamp}${random}`;
  }

  /**
   * Generate secure password for new users
   */
  generateSecurePassword(): string {
    return Password.generateSecurePassword(12);
  }

  /**
   * Validate bulk operations
   */
  async validateBulkOperation(userIds: UserId[], action: string): Promise<void> {
    for (const userId of userIds) {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      switch (action) {
        case 'delete':
          if (!user.canBeDeleted()) {
            throw new Error(`Cannot delete user ${user.fullName}`);
          }
          break;
        case 'suspend':
          if (user.isAdmin()) {
            throw new Error(`Cannot suspend admin user ${user.fullName}`);
          }
          break;
      }
    }
  }

  /**
   * Get users by department
   */
  async getUsersByDepartment(department: string): Promise<User[]> {
    const result = await this.userRepository.findUsers({
      department,
      page: 1,
      size: 1000 // Get all users in department
    });

    return result.users.map(user => {
      // Convert UserSummary to User entity
      // In real implementation, repository would return full User entities
      return new User(
        user.id as UserId,
        Email.fromString(user.email),
        Password.fromHash('placeholder'), // Not needed for this operation
        user.fullName,
        user.role,
        user.status,
        user.department,
        user.studentId
      );
    });
  }

  /**
   * Get inactive users for cleanup
   */
  async getInactiveUsers(daysInactive: number = 90): Promise<User[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    // This would require a custom repository method
    // For now, return empty array
    return [];
  }
}