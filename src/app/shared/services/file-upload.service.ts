import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
  category: 'course' | 'assignment' | 'profile' | 'document' | 'image' | 'video';
  metadata?: Record<string, any>;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface FileUploadOptions {
  category: 'course' | 'assignment' | 'profile' | 'document' | 'image' | 'video';
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  compress?: boolean;
  quality?: number; // for image compression
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private http = inject(HttpClient);

  // API Configuration
  private readonly API_BASE_URL = 'https://api.lms-maritime.com/v1';
  private readonly ENDPOINTS = {
    upload: '/files/upload',
    delete: '/files/delete',
    list: '/files/list',
    generateThumbnail: '/files/thumbnail'
  };

  // Signals for reactive state management
  private _uploadedFiles = signal<UploadedFile[]>([]);
  private _uploadProgress = signal<Map<string, UploadProgress>>(new Map());
  private _isUploading = signal<boolean>(false);
  private _uploadQueue = signal<string[]>([]);

  // Readonly signals for external consumption
  readonly uploadedFiles = this._uploadedFiles.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly isUploading = this._isUploading.asReadonly();
  readonly uploadQueue = this._uploadQueue.asReadonly();

  // Computed signals
  readonly totalUploadedFiles = computed(() => this._uploadedFiles().length);
  readonly totalUploadSize = computed(() => 
    this._uploadedFiles().reduce((sum, file) => sum + file.size, 0)
  );

  readonly filesByCategory = computed(() => {
    const files = this._uploadedFiles();
    return {
      course: files.filter(f => f.category === 'course'),
      assignment: files.filter(f => f.category === 'assignment'),
      profile: files.filter(f => f.category === 'profile'),
      document: files.filter(f => f.category === 'document'),
      image: files.filter(f => f.category === 'image'),
      video: files.filter(f => f.category === 'video')
    };
  });

  readonly activeUploads = computed(() => {
    const progressMap = this._uploadProgress();
    return Array.from(progressMap.values()).filter(p => p.status === 'uploading');
  });

  constructor() {
    this.loadMockFiles();
  }

  // File Upload Methods
  async uploadFile(
    file: File, 
    options: FileUploadOptions,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile> {
    // Validate file
    this.validateFile(file, options);

    const fileId = this.generateFileId();
    this._isUploading.set(true);

    // Add to upload queue
    this._uploadQueue.update(queue => [...queue, fileId]);

    // Initialize progress tracking
    const initialProgress: UploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    };
    
    this._uploadProgress.update(progressMap => {
      const newMap = new Map(progressMap);
      newMap.set(fileId, initialProgress);
      return newMap;
    });

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', options.category);
      formData.append('generateThumbnail', String(options.generateThumbnail || false));
      formData.append('compress', String(options.compress || false));
      formData.append('quality', String(options.quality || 80));

      // Upload file
      const uploadedFile = await this.performUpload(formData, fileId, onProgress);

      // Add to uploaded files
      this._uploadedFiles.update(files => [uploadedFile, ...files]);

      // Update progress to completed
      this._uploadProgress.update(progressMap => {
        const newMap = new Map(progressMap);
        newMap.set(fileId, {
          ...initialProgress,
          progress: 100,
          status: 'completed'
        });
        return newMap;
      });

      // Remove from queue
      this._uploadQueue.update(queue => queue.filter(id => id !== fileId));

      return uploadedFile;

    } catch (error) {
      // Update progress to error
      this._uploadProgress.update(progressMap => {
        const newMap = new Map(progressMap);
        newMap.set(fileId, {
          ...initialProgress,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        });
        return newMap;
      });

      // Remove from queue
      this._uploadQueue.update(queue => queue.filter(id => id !== fileId));

      throw error;
    } finally {
      this._isUploading.set(false);
    }
  }

  async uploadMultipleFiles(
    files: File[],
    options: FileUploadOptions,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, options, onProgress)
    );

    return Promise.all(uploadPromises);
  }

  private async performUpload(
    formData: FormData,
    fileId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile> {
    // Simulate API call with progress tracking
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate successful upload
          const file = formData.get('file') as File;
          const uploadedFile: UploadedFile = {
            id: fileId,
            name: file?.name || 'unknown',
            originalName: file?.name || 'unknown',
            size: file?.size || 0,
            type: file?.type || 'unknown',
            url: `https://storage.lms-maritime.com/files/${fileId}`,
            thumbnailUrl: formData.get('generateThumbnail') === 'true' 
              ? `https://storage.lms-maritime.com/thumbnails/${fileId}` 
              : undefined,
            uploadedAt: new Date(),
            uploadedBy: 'current-user',
            category: formData.get('category') as any,
            metadata: {
              compressed: formData.get('compress') === 'true',
              quality: parseInt(formData.get('quality') as string)
            }
          };

          resolve(uploadedFile);
        } else {
          // Update progress
          this._uploadProgress.update(progressMap => {
            const newMap = new Map(progressMap);
            const currentProgress = newMap.get(fileId);
            if (currentProgress) {
              newMap.set(fileId, {
                ...currentProgress,
                progress: Math.round(progress)
              });
            }
            return newMap;
          });

          // Call progress callback
          const currentProgress = this._uploadProgress().get(fileId);
          if (currentProgress && onProgress) {
            onProgress(currentProgress);
          }
        }
      }, 200);
    });
  }

  // File Management Methods
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.simulateApiCall();
      
      this._uploadedFiles.update(files => 
        files.filter(file => file.id !== fileId)
      );
      
      this._uploadProgress.update(progressMap => {
        const newMap = new Map(progressMap);
        newMap.delete(fileId);
        return newMap;
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getFiles(category?: string): Promise<UploadedFile[]> {
    try {
      await this.simulateApiCall();
      
      if (category) {
        return this._uploadedFiles().filter(file => file.category === category);
      }
      
      return this._uploadedFiles();
    } catch (error) {
      console.error('Error fetching files:', error);
      return this._uploadedFiles();
    }
  }

  // File Validation Methods
  private validateFile(file: File, options: FileUploadOptions): void {
    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.formatFileSize(options.maxSize)}`);
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
    }

    // Additional validation based on category
    switch (options.category) {
      case 'image':
        if (!file.type.startsWith('image/')) {
          throw new Error('File must be an image');
        }
        break;
      case 'video':
        if (!file.type.startsWith('video/')) {
          throw new Error('File must be a video');
        }
        break;
      case 'document':
        const documentTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain'
        ];
        if (!documentTypes.includes(file.type)) {
          throw new Error('File must be a document (PDF, Word, Excel, or text)');
        }
        break;
    }
  }

  // Utility Methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📎';
  }

  getFileCategoryIcon(category: string): string {
    switch (category) {
      case 'course': return '📚';
      case 'assignment': return '📝';
      case 'profile': return '👤';
      case 'document': return '📄';
      case 'image': return '🖼️';
      case 'video': return '🎥';
      default: return '📎';
    }
  }

  // Mock Data Methods
  private loadMockFiles(): void {
    const mockFiles: UploadedFile[] = [
      {
        id: 'file_1',
        name: 'maritime-safety-guide.pdf',
        originalName: 'maritime-safety-guide.pdf',
        size: 2048576, // 2MB
        type: 'application/pdf',
        url: 'https://storage.lms-maritime.com/files/file_1',
        uploadedAt: new Date('2024-09-20'),
        uploadedBy: 'teacher@demo.com',
        category: 'course',
        metadata: { compressed: false }
      },
      {
        id: 'file_2',
        name: 'ship-engineering-diagram.jpg',
        originalName: 'ship-engineering-diagram.jpg',
        size: 1024768, // 1MB
        type: 'image/jpeg',
        url: 'https://storage.lms-maritime.com/files/file_2',
        thumbnailUrl: 'https://storage.lms-maritime.com/thumbnails/file_2',
        uploadedAt: new Date('2024-09-21'),
        uploadedBy: 'teacher@demo.com',
        category: 'assignment',
        metadata: { compressed: true, quality: 80 }
      },
      {
        id: 'file_3',
        name: 'navigation-procedures.mp4',
        originalName: 'navigation-procedures.mp4',
        size: 52428800, // 50MB
        type: 'video/mp4',
        url: 'https://storage.lms-maritime.com/files/file_3',
        uploadedAt: new Date('2024-09-19'),
        uploadedBy: 'teacher@demo.com',
        category: 'course',
        metadata: { compressed: false }
      }
    ];

    this._uploadedFiles.set(mockFiles);
  }

  private generateFileId(): string {
    return 'file_' + Math.random().toString(36).substr(2, 9);
  }

  private async simulateApiCall(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Clear upload progress after completion
  clearUploadProgress(fileId: string): void {
    this._uploadProgress.update(progressMap => {
      const newMap = new Map(progressMap);
      newMap.delete(fileId);
      return newMap;
    });
  }

  // Clear all upload progress
  clearAllUploadProgress(): void {
    this._uploadProgress.set(new Map());
  }
}