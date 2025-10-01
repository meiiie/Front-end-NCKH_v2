import { Routes } from '@angular/router';

export const learningRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./learning-new.component').then(m => m.LearningNewComponent),
    title: 'Học tập - LMS Maritime'
  },
  {
    path: 'select',
    loadComponent: () => import('./components/course-selection.component').then(m => m.CourseSelectionComponent),
    title: 'Chọn khóa học - LMS Maritime'
  },
  {
    path: 'course/:id',
    loadComponent: () => import('./components/enhanced-learning-interface.component').then(m => m.EnhancedLearningInterfaceComponent),
    title: 'Khóa học - LMS Maritime'
  },
  {
    path: 'planner',
    loadComponent: () => import('./components/study-planner.component').then(m => m.StudyPlannerComponent),
    title: 'Study Planner - LMS Maritime'
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/learning-calendar.component').then(m => m.LearningCalendarComponent),
    title: 'Learning Calendar - LMS Maritime'
  },
  {
    path: 'notes',
    loadComponent: () => import('./components/note-taking.component').then(m => m.NoteTakingComponent),
    title: 'Ghi chú - LMS Maritime'
  },
  {
    path: 'bookmarks',
    loadComponent: () => import('./components/bookmark-system.component').then(m => m.BookmarkSystemComponent),
    title: 'Bookmarks - LMS Maritime'
  },
  {
    path: 'quiz',
    loadComponent: () => import('./quiz/quiz-list.component').then(m => m.QuizListComponent),
    title: 'Danh sách Quiz - LMS Maritime'
  },
  {
    path: 'quiz/attempt/:id',
    loadComponent: () => import('./quiz/quiz-attempt-new.component').then(m => m.QuizAttemptNewComponent),
    title: 'Làm Quiz - LMS Maritime'
  },
  {
    path: 'quiz/:id/preview',
    loadComponent: () => import('./quiz/enhanced-quiz.component').then(m => m.EnhancedQuizComponent),
    title: 'Xem trước Quiz - LMS Maritime'
  },
  {
    path: 'quiz/result',
    loadComponent: () => import('./quiz/quiz-result-new.component').then(m => m.QuizResultNewComponent),
    title: 'Kết quả Quiz - LMS Maritime'
  },
  {
    path: 'learning-paths',
    loadComponent: () => import('./components/personalized-learning-paths.component').then(m => m.PersonalizedLearningPathsComponent),
    title: 'Learning Paths - LMS Maritime'
  },
  {
    path: 'learning-path/:id',
    loadComponent: () => import('./components/learning-path-detail.component').then(m => m.LearningPathDetailComponent),
    title: 'Learning Path Detail - LMS Maritime'
  }
];
