import { Component, input, output, signal, computed, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadService, FileUploadOptions, UploadedFile, UploadProgress } from '../../services/file-upload.service';

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="file-upload-container">
      <!-- Upload Area -->
      <div class="upload-area"
           [class]="getUploadAreaClass()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           (click)="triggerFileInput()">
        
        <input #fileInput
               type="file"
               [multiple]="multiple()"
               [accept]="acceptedTypes()"
               (change)="onFileSelect($event)"
               class="hidden">
        
        <div class="upload-content">
          @if (isDragOver()) {
            <div class="text-center">
              <svg class="w-12 h-12 text-purple-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
              <p class="text-lg font-medium text-purple-600">Thả file vào đây</p>
            </div>
          } @else {
            <div class="text-center">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
              <p class="text-lg font-medium text-gray-900 mb-2">{{ title() }}</p>
              <p class="text-sm text-gray-500 mb-4">{{ description() }}</p>
              <button type="button" 
                      class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Chọn file
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Upload Progress -->
      @if (activeUploads().length > 0) {
        <div class="mt-4 space-y-3">
          <h4 class="text-sm font-medium text-gray-900">Đang tải lên...</h4>
          @for (upload of activeUploads(); track upload.fileId) {
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-3">
                  <span class="text-lg">{{ fileUploadService.getFileIcon('') }}</span>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ upload.fileName }}</p>
                    <p class="text-xs text-gray-500">{{ upload.progress }}%</p>
                  </div>
                </div>
                <button (click)="cancelUpload(upload.fileId)"
                        class="p-1 text-gray-400 hover:text-red-600 transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </button>
              </div>
              
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                     [style.width.%]="upload.progress"></div>
              </div>
              
              @if (upload.status === 'error') {
                <p class="text-xs text-red-600 mt-2">{{ upload.error }}</p>
              }
            </div>
          }
        </div>
      }

      <!-- Uploaded Files List -->
      @if (uploadedFiles().length > 0) {
        <div class="mt-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-medium text-gray-900">File đã tải lên</h4>
            <span class="text-xs text-gray-500">{{ uploadedFiles().length }} file</span>
          </div>
          
          <div class="space-y-2">
            @for (file of uploadedFiles(); track file.id) {
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-3">
                  <span class="text-lg">{{ fileUploadService.getFileIcon(file.type) }}</span>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ file.originalName }}</p>
                    <p class="text-xs text-gray-500">
                      {{ fileUploadService.formatFileSize(file.size) }} • 
                      {{ formatDate(file.uploadedAt) }}
                    </p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <button (click)="previewFile(file)"
                          class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Xem trước">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                  
                  <button (click)="downloadFile(file)"
                          class="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Tải xuống">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                  
                  <button (click)="removeFile(file.id)"
                          class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Xóa">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- File Type Restrictions -->
      @if (showRestrictions()) {
        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <h5 class="text-sm font-medium text-blue-900 mb-2">Giới hạn file</h5>
          <ul class="text-xs text-blue-800 space-y-1">
            <li>• Kích thước tối đa: {{ fileUploadService.formatFileSize(maxFileSize()) }}</li>
            <li>• Loại file cho phép: {{ acceptedTypes() || 'Tất cả' }}</li>
            @if (category()) {
              <li>• Danh mục: {{ getCategoryName(category()!) }}</li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  protected fileUploadService = inject(FileUploadService);

  // Inputs
  title = input<string>('Tải lên file');
  description = input<string>('Kéo thả file vào đây hoặc click để chọn');
  multiple = input<boolean>(false);
  category = input<'course' | 'assignment' | 'profile' | 'document' | 'image' | 'video'>('document');
  maxFileSize = input<number>(10 * 1024 * 1024); // 10MB default
  acceptedTypes = input<string>('');
  showRestrictions = input<boolean>(true);
  disabled = input<boolean>(false);

  // Outputs
  filesUploaded = output<UploadedFile[]>();
  fileRemoved = output<string>();
  uploadProgress = output<UploadProgress>();
  uploadError = output<Error>();

  // State
  isDragOver = signal(false);
  uploadedFiles = signal<UploadedFile[]>([]);

  // Computed properties
  activeUploads = computed(() => this.fileUploadService.activeUploads());

  getUploadAreaClass(): string {
    const baseClasses = 'border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer';
    
    if (this.disabled()) {
      return `${baseClasses} border-gray-200 bg-gray-50 cursor-not-allowed opacity-50`;
    }
    
    if (this.isDragOver()) {
      return `${baseClasses} border-purple-400 bg-purple-50`;
    }
    
    return `${baseClasses} border-gray-300 hover:border-purple-400 hover:bg-purple-50`;
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled()) return;
    
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    if (this.disabled()) return;
    
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    if (this.disabled()) return;
    
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(Array.from(files));
    }
  }

  triggerFileInput(): void {
    if (this.disabled()) return;
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    
    if (files && files.length > 0) {
      this.handleFiles(Array.from(files));
    }
  }

  private async handleFiles(files: File[]): Promise<void> {
    try {
      const uploadOptions: FileUploadOptions = {
        category: this.category(),
        maxSize: this.maxFileSize(),
        allowedTypes: this.acceptedTypes() ? this.acceptedTypes().split(',') : undefined,
        generateThumbnail: this.category() === 'image',
        compress: this.category() === 'image',
        quality: 80
      };

      const uploadedFiles = await this.fileUploadService.uploadMultipleFiles(
        files,
        uploadOptions,
        (progress) => {
          this.uploadProgress.emit(progress);
        }
      );

      this.uploadedFiles.update(current => [...current, ...uploadedFiles]);
      this.filesUploaded.emit(uploadedFiles);

    } catch (error) {
      console.error('Upload error:', error);
      this.uploadError.emit(error instanceof Error ? error : new Error('Upload failed'));
    }
  }

  async removeFile(fileId: string): Promise<void> {
    try {
      await this.fileUploadService.deleteFile(fileId);
      this.uploadedFiles.update(files => files.filter(f => f.id !== fileId));
      this.fileRemoved.emit(fileId);
    } catch (error) {
      console.error('Error removing file:', error);
    }
  }

  previewFile(file: UploadedFile): void {
    // Open file in new tab for preview
    window.open(file.url, '_blank');
  }

  downloadFile(file: UploadedFile): void {
    // Create download link
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  cancelUpload(fileId: string): void {
    // Note: In a real implementation, you would need to implement actual upload cancellation
    this.fileUploadService.clearUploadProgress(fileId);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCategoryName(category: string): string {
    const categoryNames: Record<string, string> = {
      'course': 'Khóa học',
      'assignment': 'Bài tập',
      'profile': 'Hồ sơ',
      'document': 'Tài liệu',
      'image': 'Hình ảnh',
      'video': 'Video'
    };
    return categoryNames[category] || category;
  }
}