import { UserId, UserFilter, UserSort, UserListResult, UserDetails, CreateUserRequest, UpdateUserRequest } from '../types';
import { User } from '../entities/user.entity';

/**
 * Repository Interface: User Repository
 * Defines the contract for user data access operations
 */
export interface UserRepository {
  /**
   * Find user by ID
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find users with filtering and pagination
   */
  findUsers(filter: UserFilter, sort?: UserSort): Promise<UserListResult>;

  /**
   * Get user details by ID
   */
  getUserDetails(id: UserId): Promise<UserDetails | null>;

  /**
   * Create new user
   */
  create(userData: CreateUserRequest): Promise<User>;

  /**
   * Update existing user
   */
  update(id: UserId, userData: UpdateUserRequest): Promise<User>;

  /**
   * Delete user by ID
   */
  delete(id: UserId): Promise<boolean>;

  /**
   * Check if email exists
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Count users by role
   */
  countByRole(role: string): Promise<number>;

  /**
   * Count users by status
   */
  countByStatus(status: string): Promise<number>;

  /**
   * Get total user count
   */
  count(): Promise<number>;

  /**
   * Bulk operations
   */
  bulkUpdateStatus(userIds: UserId[], status: string): Promise<number>;
  bulkDelete(userIds: UserId[]): Promise<number>;
}