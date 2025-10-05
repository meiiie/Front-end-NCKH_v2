import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { CourseRepository, CourseStatistics } from '../../domain/repositories/course.repository';
import { Course } from '../../domain/entities/course.entity';
import { CourseSpecifications } from '../../domain/value-objects/course-specifications';
import {
  CourseId,
  InstructorId,
  CourseStatus,
  CourseLevel,
  CertificateType,
  CourseFilters,
  CourseSortOptions,
  PaginationOptions,
  PaginatedResult
} from '../../domain/types';

/**
 * Repository Implementation: Course Repository Implementation
 * Concrete implementation of CourseRepository interface
 * Handles data access and mapping between domain and infrastructure layers
 */
@Injectable({
  providedIn: 'root'
})
export class CourseRepositoryImpl implements CourseRepository {
  // Mock data store - in real implementation, this would be API calls
  private courses: Course[] = this.initializeMockData();

  constructor() {}

  findById(id: CourseId): Observable<Course | null> {
    const course = this.courses.find(c => c.id === id);
    return of(course || null).pipe(delay(100)); // Simulate API delay
  }

  findAll(
    filters?: CourseFilters,
    sort?: CourseSortOptions,
    pagination?: PaginationOptions
  ): Observable<PaginatedResult<Course>> {
    let filteredCourses = [...this.courses];

    // Apply filters
    if (filters) {
      filteredCourses = this.applyFilters(filteredCourses, filters);
    }

    // Apply sorting
    if (sort) {
      filteredCourses = this.applySorting(filteredCourses, sort);
    }

    // Apply pagination
    const total = filteredCourses.length;
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredCourses.slice(startIndex, endIndex);

    const result: PaginatedResult<Course> = {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: endIndex < total,
      hasPrev: page > 1
    };

    return of(result).pipe(delay(150));
  }

  findByInstructor(
    instructorId: InstructorId,
    filters?: CourseFilters,
    sort?: CourseSortOptions,
    pagination?: PaginationOptions
  ): Observable<PaginatedResult<Course>> {
    const instructorFilters = { ...filters, instructorId: [instructorId] };
    return this.findAll(instructorFilters, sort, pagination);
  }

  findByCategory(
    category: string,
    filters?: CourseFilters,
    sort?: CourseSortOptions,
    pagination?: PaginationOptions
  ): Observable<PaginatedResult<Course>> {
    const categoryFilters = { ...filters, category: [category] };
    return this.findAll(categoryFilters, sort, pagination);
  }

  search(
    query: string,
    filters?: CourseFilters,
    sort?: CourseSortOptions,
    pagination?: PaginationOptions
  ): Observable<PaginatedResult<Course>> {
    const searchFilters = { ...filters, searchQuery: query };
    return this.findAll(searchFilters, sort, pagination);
  }

  save(course: Course): Observable<Course> {
    // Check if course already exists
    const existingIndex = this.courses.findIndex(c => c.id === course.id);

    if (existingIndex >= 0) {
      // Update existing course
      this.courses[existingIndex] = course;
    } else {
      // Add new course
      this.courses.push(course);
    }

    return of(course).pipe(delay(200));
  }

  update(id: CourseId, updates: Partial<Course>): Observable<Course> {
    const courseIndex = this.courses.findIndex(c => c.id === id);

    if (courseIndex === -1) {
      return throwError(() => new Error(`Course with id ${id} not found`));
    }

    // In a real implementation, this would create a new Course instance
    // For now, we'll simulate the update
    const updatedCourse = { ...this.courses[courseIndex], ...updates } as Course;
    this.courses[courseIndex] = updatedCourse;

    return of(updatedCourse).pipe(delay(150));
  }

  delete(id: CourseId): Observable<void> {
    const courseIndex = this.courses.findIndex(c => c.id === id);

    if (courseIndex === -1) {
      return throwError(() => new Error(`Course with id ${id} not found`));
    }

    this.courses.splice(courseIndex, 1);
    return of(void 0).pipe(delay(100));
  }

  exists(id: CourseId): Observable<boolean> {
    const exists = this.courses.some(c => c.id === id);
    return of(exists).pipe(delay(50));
  }

  getStatistics(): Observable<CourseStatistics> {
    const stats: CourseStatistics = {
      totalCourses: this.courses.length,
      publishedCourses: this.courses.filter(c => c.status === CourseStatus.PUBLISHED).length,
      draftCourses: this.courses.filter(c => c.status === CourseStatus.DRAFT).length,
      archivedCourses: this.courses.filter(c => c.status === CourseStatus.ARCHIVED).length,
      totalStudents: this.courses.reduce((sum, c) => sum + c.metadata.studentsCount, 0),
      averageRating: this.courses.length > 0
        ? this.courses.reduce((sum, c) => sum + c.metadata.rating, 0) / this.courses.length
        : 0,
      totalRevenue: this.courses.reduce((sum, c) => sum + (c.specifications.price * c.metadata.studentsCount), 0),
      coursesByCategory: this.getCoursesByCategory(),
      coursesByLevel: this.getCoursesByLevel()
    };

    return of(stats).pipe(delay(100));
  }

  getPopular(limit: number = 10): Observable<Course[]> {
    const popularCourses = [...this.courses]
      .filter(c => c.isPublished())
      .sort((a, b) => b.metadata.studentsCount - a.metadata.studentsCount)
      .slice(0, limit);

    return of(popularCourses).pipe(delay(100));
  }

  getNew(limit: number = 10): Observable<Course[]> {
    const newCourses = [...this.courses]
      .filter(c => c.isPublished() && c.isNew())
      .sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime())
      .slice(0, limit);

    return of(newCourses).pipe(delay(100));
  }

  getFeatured(limit: number = 10): Observable<Course[]> {
    // For now, featured courses are those with high rating and many students
    const featuredCourses = [...this.courses]
      .filter(c => c.isPublished() && c.hasGoodRating() && c.isPopular())
      .sort((a, b) => b.metadata.rating - a.metadata.rating)
      .slice(0, limit);

    return of(featuredCourses).pipe(delay(100));
  }

  private applyFilters(courses: Course[], filters: CourseFilters): Course[] {
    return courses.filter(course => {
      if (filters.status && !filters.status.includes(course.status)) {
        return false;
      }

      if (filters.level && !filters.level.includes(course.specifications.level)) {
        return false;
      }

      if (filters.category && !filters.category.includes(course.category)) {
        return false;
      }

      if (filters.instructorId && !filters.instructorId.includes(course.instructorId)) {
        return false;
      }

      if (filters.priceRange) {
        const price = course.specifications.price;
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return false;
        }
      }

      if (filters.rating && course.metadata.rating < filters.rating) {
        return false;
      }

      if (filters.searchQuery && !course.matchesSearch(filters.searchQuery)) {
        return false;
      }

      if (filters.dateRange) {
        const createdAt = course.metadata.createdAt;
        if (createdAt < filters.dateRange.start || createdAt > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }

  private applySorting(courses: Course[], sort: CourseSortOptions): Course[] {
    return [...courses].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'price':
          aValue = a.specifications.price;
          bValue = b.specifications.price;
          break;
        case 'rating':
          aValue = a.metadata.rating;
          bValue = b.metadata.rating;
          break;
        case 'students':
          aValue = a.metadata.studentsCount;
          bValue = b.metadata.studentsCount;
          break;
        case 'createdAt':
          aValue = a.metadata.createdAt.getTime();
          bValue = b.metadata.createdAt.getTime();
          break;
        case 'updatedAt':
          aValue = a.metadata.updatedAt.getTime();
          bValue = b.metadata.updatedAt.getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private getCoursesByCategory(): Record<string, number> {
    return this.courses.reduce((acc, course) => {
      acc[course.category] = (acc[course.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getCoursesByLevel(): Record<string, number> {
    return this.courses.reduce((acc, course) => {
      const level = course.specifications.level;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private initializeMockData(): Course[] {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return [
      new Course(
        'course-1' as CourseId,
        'Kỹ thuật Tàu biển Cơ bản',
        'Khóa học toàn diện về kỹ thuật tàu biển, bao gồm thiết kế, vận hành và bảo trì.',
        'Nền tảng kỹ thuật tàu biển',
        'engineering',
        'instructor-1' as InstructorId,
        new CourseSpecifications(
          40, CourseLevel.BEGINNER, 100, 2500000,
          ['Cơ bản toán học'], CertificateType.STCW, 8, 32
        ),
        CourseStatus.PUBLISHED,
        ['Kỹ thuật', 'Tàu biển', 'Cơ bản'],
        ['Thiết kế tàu', 'Động cơ', 'Hệ thống điện'],
        '/assets/images/courses/engineering-basic.jpg',
        {
          createdAt: oneMonthAgo,
          updatedAt: now,
          createdBy: 'instructor-1' as InstructorId,
          studentsCount: 150,
          rating: 4.8,
          reviewsCount: 45,
          isPopular: true,
          isNew: false,
          version: 1
        }
      ),
      new Course(
        'course-2' as CourseId,
        'An toàn Hàng hải STCW',
        'Chứng chỉ STCW cơ bản về an toàn hàng hải theo tiêu chuẩn quốc tế.',
        'An toàn hàng hải theo chuẩn STCW',
        'safety',
        'instructor-2' as InstructorId,
        new CourseSpecifications(
          24, CourseLevel.BEGINNER, 200, 1800000,
          [], CertificateType.STCW, 6, 24
        ),
        CourseStatus.PUBLISHED,
        ['STCW', 'An toàn', 'Hàng hải'],
        ['Ứng phó khẩn cấp', 'An toàn cá nhân', 'Quy tắc hàng hải'],
        '/assets/images/courses/stcw-basic.jpg',
        {
          createdAt: oneWeekAgo,
          updatedAt: now,
          createdBy: 'instructor-2' as InstructorId,
          studentsCount: 300,
          rating: 4.9,
          reviewsCount: 89,
          isPopular: true,
          isNew: true,
          version: 1
        }
      )
    ];
  }
}