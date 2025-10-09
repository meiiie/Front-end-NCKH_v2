import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorHandlingService } from '../../../../shared/services/error-handling.service';
import { environment } from '../../../../../environments/environment';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private errorService = inject(ErrorHandlingService);

  // API Configuration
  private readonly API_BASE_URL = `${environment.apiUrl}/api/v1`;
  private readonly ENDPOINTS = {
    generateUploadUrl: '/files/generate-upload-url',
    validateUpload: '/files/validate-upload',
    getUploadHistory: '/files/upload-history',
    deleteFile: '/files/delete'
  };

  // Upload progress tracking
  private _uploadProgress = signal<UploadProgress | null>(null);
  private _isUploading = signal<boolean>(false);

  // Readonly signals
  readonly uploadProgress = this._uploadProgress.asReadonly();
  readonly isUploading = this._isUploading.asReadonly();

  // File Upload Methods
  async generateUploadUrl(fileName: string, fileSize: number, type: string = 'document'): Promise<{uploadUrl: string, fileUrl: string}> {
    try {
      const request = {
        fileName,
        fileSize,
        type
      };

      const response = await firstValueFrom(this.http.post<any>(
        `${this.API_BASE_URL}${this.ENDPOINTS.generateUploadUrl}`,
        request,
        { headers: this.getAuthHeaders() }
      ));

      if (response?.success && response?.data) {
        return {
          uploadUrl: response.data.uploadUrl,
          fileUrl: response.data.fileUrl
        };
      } else {
        throw new Error(response?.message || 'Failed to generate upload URL');
      }
    } catch (error: any) {
      console.error('Failed to generate upload URL:', error);
      throw error;
    }
  }

  async uploadFileToBlob(uploadUrl: string, file: File): Promise<void> {
    try {
      this._isUploading.set(true);
      this._uploadProgress.set({ loaded: 0, total: file.size, percentage: 0 });

      await firstValueFrom(this.http.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type
        },
        reportProgress: true,
        observe: 'events'
      }).pipe(
        // Note: In a real implementation, you'd handle HttpProgressEvent here
        // For now, we'll simulate progress
      ));

      this._uploadProgress.set({ loaded: file.size, total: file.size, percentage: 100 });
    } catch (error: any) {
      console.error('Failed to upload file to blob:', error);
      throw error;
    } finally {
      this._isUploading.set(false);
    }
  }

  async validateFileUpload(fileUrl: string): Promise<void> {
    try {
      const request = { fileUrl };

      const response = await firstValueFrom(this.http.post<any>(
        `${this.API_BASE_URL}${this.ENDPOINTS.validateUpload}`,
        request,
        { headers: this.getAuthHeaders() }
      ));

      if (!response?.success) {
        throw new Error(response?.message || 'File validation failed');
      }
    } catch (error: any) {
      console.error('File validation failed:', error);
      throw error;
    }
  }

  async uploadFile(file: File, type: string = 'document'): Promise<UploadResult> {
    try {
      // Validate file first
      const validation = this.validateFile(file, type);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate signed upload URL
      const { uploadUrl, fileUrl } = await this.generateUploadUrl(file.name, file.size, type);

      // Upload file to Vercel Blob
      await this.uploadFileToBlob(uploadUrl, file);

      // Validate upload
      await this.validateFileUpload(fileUrl);

      const result: UploadResult = {
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date()
      };

      this.errorService.showSuccess('File đã được upload thành công!', 'file-upload');
      return result;
    } catch (error: any) {
      console.error('File upload failed:', error);
      this.errorService.addError({
        message: error.message || 'Upload file thất bại. Vui lòng thử lại.',
        type: 'error',
        context: 'file-upload'
      });
      throw error;
    }
  }

  // File Validation Methods
  validateFile(file: File, type: string = 'document'): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    const maxSize = this.getMaxFileSize(type);
    if (file.size > maxSize) {
      errors.push(`Kích thước file vượt quá giới hạn cho phép (${this.formatFileSize(maxSize)})`);
    }

    // Check file type
    const allowedTypes = this.getAllowedFileTypes(type);
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Loại file không được hỗ trợ. Các loại cho phép: ${allowedTypes.join(', ')}`);
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      errors.push('Tên file không được để trống');
    }

    // Security checks
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExtension)) {
      errors.push('Loại file không an toàn');
    }

    // Warnings
    if (file.size > maxSize * 0.8) {
      warnings.push('File có kích thước lớn, có thể ảnh hưởng đến tốc độ upload');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Bulk Upload Methods
  async uploadMultipleFiles(files: File[], type: string = 'document'): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, type);
        results.push(result);
      } catch (error: any) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      this.errorService.addError({
        message: `Upload ${errors.length} file thất bại: ${errors.join('; ')}`,
        type: 'warning',
        context: 'bulk-upload'
      });
    }

    if (results.length > 0) {
      this.errorService.showSuccess(`Đã upload thành công ${results.length} file!`, 'bulk-upload');
    }

    return results;
  }

  // File Management Methods
  async getUploadHistory(page: number = 1, limit: number = 20): Promise<{
    files: UploadResult[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await firstValueFrom(this.http.get<any>(
        `${this.API_BASE_URL}${this.ENDPOINTS.getUploadHistory}?${params}`,
        { headers: this.getAuthHeaders() }
      ));

      if (response?.success && response?.data) {
        return {
          files: response.data.files || [],
          pagination: response.data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 }
        };
      } else {
        return {
          files: [],
          pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
        };
      }
    } catch (error) {
      console.error('Failed to get upload history:', error);
      return {
        files: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
      };
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.http.delete<any>(
        `${this.API_BASE_URL}${this.ENDPOINTS.deleteFile}`,
        {
          headers: this.getAuthHeaders(),
          body: { fileUrl }
        }
      ));

      if (response?.success) {
        this.errorService.showSuccess('File đã được xóa thành công!', 'file-delete');
      } else {
        throw new Error(response?.message || 'Failed to delete file');
      }
    } catch (error: any) {
      console.error('Failed to delete file:', error);
      this.errorService.addError({
        message: 'Xóa file thất bại. Vui lòng thử lại.',
        type: 'error',
        context: 'file-delete'
      });
      throw error;
    }
  }

  // Utility Methods
  private getAuthHeaders(): { [header: string]: string } {
    const token = this.authService.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private getMaxFileSize(type: string): number {
    const sizeLimits: { [key: string]: number } = {
      'document': 10 * 1024 * 1024, // 10MB
      'image': 5 * 1024 * 1024,     // 5MB
      'video': 100 * 1024 * 1024,   // 100MB
      'audio': 50 * 1024 * 1024,    // 50MB
      'archive': 50 * 1024 * 1024   // 50MB
    };
    return sizeLimits[type] || sizeLimits['document'];
  }

  private getAllowedFileTypes(type: string): string[] {
    const typeMappings: { [key: string]: string[] } = {
      'document': [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ],
      'image': [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
      ],
      'video': [
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv'
      ],
      'audio': [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg'
      ],
      'archive': [
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed'
      ]
    };
    return typeMappings[type] || typeMappings['document'];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Progress tracking
  resetUploadProgress(): void {
    this._uploadProgress.set(null);
    this._isUploading.set(false);
  }

  // File type detection
  getFileTypeFromExtension(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop() || '';
    const typeMappings: { [key: string]: string } = {
      'pdf': 'document',
      'doc': 'document',
      'docx': 'document',
      'xls': 'document',
      'xlsx': 'document',
      'txt': 'document',
      'csv': 'document',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'webp': 'image',
      'svg': 'image',
      'mp4': 'video',
      'avi': 'video',
      'mov': 'video',
      'wmv': 'video',
      'mp3': 'audio',
      'wav': 'audio',
      'ogg': 'audio',
      'zip': 'archive',
      'rar': 'archive',
      '7z': 'archive'
    };
    return typeMappings[extension] || 'document';
  }
}