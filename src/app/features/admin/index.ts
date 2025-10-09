import { Provider } from '@angular/core';
import { UserRepository } from './domain/repositories/user.repository';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl';
import { USER_REPOSITORY } from './domain/services/user-domain.service';

/**
 * Admin Feature Providers
 * Dependency injection configuration for the Admin domain
 */
export const adminProviders: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserRepositoryImpl
  }
];

/**
 * Admin Feature Exports
 */
export * from './domain/types';
export * from './domain/entities/user.entity';
export * from './domain/value-objects/email';
export * from './domain/value-objects/password';
export * from './domain/repositories/user.repository';
export * from './domain/services/user-domain.service';
export * from './application/use-cases/create-user.use-case';
export * from './infrastructure/repositories/user.repository.impl';

// Export new specialized services
export { AdminService } from './infrastructure/services/admin.service';
export { UserManagementService } from './infrastructure/services/user-management.service';
export { CourseManagementService } from './infrastructure/services/course-management.service';
export { AnalyticsService } from './infrastructure/services/analytics.service';
export { SystemSettingsService } from './infrastructure/services/system-settings.service';
export { FileUploadService } from './infrastructure/services/file-upload.service';

// Export components
export * from './presentation/components/admin-layout-simple.component';
export * from './presentation/components/admin.component';
export * from './presentation/components/user-management.component';
export * from './presentation/components/course-management.component';
export * from './presentation/components/admin-analytics.component';
export * from './presentation/components/system-settings.component';