import { inject, Injectable } from '@angular/core';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserDomainService } from '../../domain/services/user-domain.service';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { CreateUserRequest, UserId, UserStatus } from '../../domain/types';
import { USER_REPOSITORY } from '../../domain/services/user-domain.service';

/**
 * Application Use Case: Create User
 * Orchestrates the creation of a new user with business rules validation
 */
@Injectable({
  providedIn: 'root'
})
export class CreateUserUseCase {
  private userRepository = inject(USER_REPOSITORY);
  private userDomainService = inject(UserDomainService);

  /**
   * Execute the create user use case
   */
  async execute(request: CreateUserRequest): Promise<User> {
    // Step 1: Validate the request using domain service
    await this.userDomainService.validateUserCreation(request);

    // Step 2: Generate student ID if needed
    let studentId = request.studentId;
    if (request.role === 'student' && !studentId) {
      studentId = this.userDomainService.generateStudentId();
    }

    // Step 3: Create value objects
    const email = Email.create(request.email);
    const password = Password.create(request.password);

    // Step 4: Create user entity
    const user = new User(
      this.generateUserId(),
      email,
      password,
      request.fullName,
      request.role,
      UserStatus.ACTIVE, // Default status
      request.department,
      studentId
    );

    // Step 5: Persist to repository
    const savedUser = await this.userRepository.create({
      email: email.value,
      password: password.hashedValue,
      fullName: request.fullName,
      role: request.role,
      department: request.department,
      studentId: studentId
    });

    return savedUser;
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(): UserId {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `usr_${timestamp}_${random}` as UserId;
  }
}