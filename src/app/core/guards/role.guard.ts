import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../shared/types/user.types';

/**
 * Role Guard Factory - Creates a guard that checks for specific roles
 * @param allowedRoles Array of roles that can access the route
 * @returns CanActivateFn guard function
 */
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const userRole = authService.userRole();

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // If user is authenticated but doesn't have the right role
    if (authService.isAuthenticated()) {
      // Redirect to their appropriate dashboard
      const role = authService.userRole();
      if (role) {
        return router.createUrlTree([`/${role}/dashboard`]);
      }
    }

    // If not authenticated, redirect to login
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
  };
};

/**
 * Student Guard - Only allows students
 */
export const studentGuard: CanActivateFn = roleGuard([UserRole.STUDENT]);

/**
 * Teacher Guard - Only allows teachers
 */
export const teacherGuard: CanActivateFn = roleGuard([UserRole.TEACHER]);

/**
 * Admin Guard - Only allows admins
 */
export const adminGuard: CanActivateFn = roleGuard([UserRole.ADMIN]);

/**
 * Teacher or Admin Guard - Allows both teachers and admins
 */
export const teacherOrAdminGuard: CanActivateFn = roleGuard([UserRole.TEACHER, UserRole.ADMIN]);