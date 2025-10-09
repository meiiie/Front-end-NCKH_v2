import { Injectable } from '@angular/core';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { UserId, UserFilter, UserSort, UserListResult, UserDetails, CreateUserRequest, UpdateUserRequest, UserStatus } from '../../domain/types';
import { AdminService, AdminUser } from '../services/admin.service';

/**
 * Infrastructure Repository: User Repository Implementation
 * Concrete implementation using AdminService as data source
 */
@Injectable({
  providedIn: 'root'
})
export class UserRepositoryImpl implements UserRepository {
  constructor(private adminService: AdminService) {}

  async findById(id: UserId): Promise<User | null> {
    // Since AdminService doesn't have getUserById, we'll search through all users
    // In a real implementation, this would be a separate API call
    const response = await this.adminService.getUsers(1, 1000); // Get all users
    const user = response.users.find(u => u.id === id);
    return user ? this.mapToDomainEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    // Since AdminService doesn't have getUserByEmail, we'll search through all users
    // In a real implementation, this would be a separate API call
    const response = await this.adminService.getUsers(1, 1000); // Get all users
    const user = response.users.find(u => u.email === email);
    return user ? this.mapToDomainEntity(user) : null;
  }

  async findUsers(filter: UserFilter, sort?: UserSort): Promise<UserListResult> {
    const response = await this.adminService.getUsers(
      filter.page || 1,
      filter.size || 10,
      filter.search
    );

    const domainUsers = response.users.map(user => this.mapToSummary(user));

    // Map AdminService pagination to domain pagination
    const adminPagination = response.pagination;
    let domainPagination: any;

    if (adminPagination) {
      domainPagination = {
        page: adminPagination.number + 1, // Convert 0-based to 1-based
        size: adminPagination.size,
        totalElements: adminPagination.totalElements,
        totalPages: adminPagination.totalPages,
        first: adminPagination.first,
        last: adminPagination.last,
        number: adminPagination.number
      };
    } else {
      domainPagination = {
        page: 1,
        size: response.users.length,
        totalElements: response.users.length,
        totalPages: 1,
        first: true,
        last: true,
        number: 0
      };
    }

    return {
      users: domainUsers,
      pagination: domainPagination
    };
  }

  async getUserDetails(id: UserId): Promise<UserDetails | null> {
    const user = await this.findById(id);
    return user ? this.mapToDetails(this.reverseMapToAdminUser(user)) : null;
  }

  async create(userData: CreateUserRequest): Promise<User> {
    const createdUser = await this.adminService.createUser(userData);
    return this.mapToDomainEntity(createdUser);
  }

  async update(id: UserId, userData: UpdateUserRequest): Promise<User> {
    const updatedUser = await this.adminService.updateUser(id, userData);
    return this.mapToDomainEntity(updatedUser);
  }

  async delete(id: UserId): Promise<boolean> {
    try {
      await this.adminService.deleteUser(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  async countByRole(role: string): Promise<number> {
    // This would need to be implemented in AdminService
    // For now, return a mock value
    return 0;
  }

  async countByStatus(status: string): Promise<number> {
    // This would need to be implemented in AdminService
    // For now, return a mock value
    return 0;
  }

  async count(): Promise<number> {
    return this.adminService.totalUsers();
  }

  async bulkUpdateStatus(userIds: UserId[], status: string): Promise<number> {
    let successCount = 0;
    for (const userId of userIds) {
      try {
        await this.adminService.toggleUserStatus(userId);
        successCount++;
      } catch (error) {
        // Continue with other users
      }
    }
    return successCount;
  }

  async bulkDelete(userIds: UserId[]): Promise<number> {
    let successCount = 0;
    for (const userId of userIds) {
      try {
        await this.adminService.deleteUser(userId);
        successCount++;
      } catch (error) {
        // Continue with other users
      }
    }
    return successCount;
  }

  /**
   * Map AdminUser to Domain User entity
   */
  private mapToDomainEntity(user: AdminUser): User {
    return new User(
      user.id as UserId,
      Email.fromString(user.email),
      Password.fromHash('placeholder'), // Password not needed for domain operations
      user.name,
      user.role,
      user.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE,
      user.department,
      user.studentId,
      {
        createdAt: new Date(user.createdAt || Date.now()),
        updatedAt: new Date(user.updatedAt || Date.now()),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        loginCount: user.loginCount || 0,
        coursesEnrolled: user.coursesEnrolled || 0,
        coursesCreated: user.coursesCreated || 0,
        totalSpent: user.totalSpent || 0
      }
    );
  }

  /**
   * Map AdminUser to UserSummary
   */
  private mapToSummary(user: AdminUser): any {
    return {
      id: user.id,
      fullName: user.name,
      email: user.email,
      role: user.role,
      status: user.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE,
      department: user.department,
      studentId: user.studentId,
      avatar: user.avatar,
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
      createdAt: new Date(user.createdAt || Date.now())
    };
  }

  /**
   * Map AdminUser to UserDetails
   */
  private mapToDetails(user: AdminUser): UserDetails {
    return {
      ...this.mapToSummary(user),
      loginCount: user.loginCount || 0,
      coursesEnrolled: user.coursesEnrolled || 0,
      coursesCreated: user.coursesCreated || 0,
      totalSpent: user.totalSpent || 0,
      updatedAt: new Date(user.updatedAt || Date.now())
    };
  }

  /**
   * Reverse map Domain User to AdminUser
   */
  private reverseMapToAdminUser(user: User): AdminUser {
    return {
      id: user.id,
      email: user.email.value,
      name: user.fullName,
      role: user.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=dc2626&color=ffffff&size=150`,
      department: user.department,
      studentId: user.studentId,
      createdAt: user.metadata.createdAt,
      updatedAt: user.metadata.updatedAt,
      isActive: user.isActive(),
      lastLogin: user.metadata.lastLogin || new Date(),
      loginCount: user.metadata.loginCount,
      coursesCreated: user.metadata.coursesCreated,
      coursesEnrolled: user.metadata.coursesEnrolled,
      totalSpent: user.metadata.totalSpent,
      permissions: [] // Default permissions
    };
  }
}