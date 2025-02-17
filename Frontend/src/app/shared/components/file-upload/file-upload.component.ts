import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface UploadEvent {
  file: File;
  progress: number;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="file-upload" 
         [class.drag-over]="isDragOver"
         (dragover)="onDragOver($event)"
         (dragleave)="onDragLeave($event)"
         (drop)="onDrop($event)">
      
      <input type="file"
             #fileInput
             [accept]="accept"
             [multiple]="multiple"
             (change)="onFileSelected($event)"
             class="hidden">

      <div class="upload-content" *ngIf="!currentFile; else uploadProgress">
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <div class="upload-text">
          <p class="primary-text">
            {{ dragDropText }}
          </p>
          <p class="secondary-text">
            or
          </p>
          <button mat-raised-button color="primary" (click)="fileInput.click()">
            Browse Files
          </button>
        </div>
        <p class="help-text" *ngIf="helpText">
          {{ helpText }}
        </p>
      </div>

      <ng-template #uploadProgress>
        <div class="progress-content">
          <div class="file-info">
            <mat-icon>insert_drive_file</mat-icon>
            <span class="file-name">{{ currentFile?.name || '' }}</span>
            <button mat-icon-button color="warn" (click)="cancelUpload()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <mat-progress-bar 
            mode="determinate"
            [value]="uploadProgress">
          </mat-progress-bar>
          <div class="progress-text">
            {{ uploadProgress }}% uploaded
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .file-upload {
      border: 2px dashed #ccc;
      border-radius: 4px;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
      background-color: #fafafa;
    }

    .file-upload.drag-over {
      border-color: #2196f3;
      background-color: #e3f2fd;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
    }

    .upload-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .primary-text {
      font-size: 1.1rem;
      color: #333;
      margin: 0;
    }

    .secondary-text {
      color: #666;
      margin: 0;
    }

    .help-text {
      color: #666;
      font-size: 0.875rem;
      margin: 0;
    }

    .hidden {
      display: none;
    }

    .progress-content {
      width: 100%;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .file-name {
      flex: 1;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .progress-text {
      text-align: right;
      font-size: 0.875rem;
      color: #666;
      margin-top: 0.5rem;
    }
  `]
})
export class FileUploadComponent {
  @Input() accept = '*/*';
  @Input() multiple = false;
  @Input() maxSize = 5 * 1024 * 1024; // 5MB
  @Input() dragDropText = 'Drag and drop files here';
  @Input() helpText?: string;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() uploadStarted = new EventEmitter<void>();
  @Output() uploadProgress = new EventEmitter<number>();
  @Output() uploadCompleted = new EventEmitter<File>();
  @Output() uploadCancelled = new EventEmitter<void>();
  @Output() uploadError = new EventEmitter<string>();

  isDragOver = false;
  currentFile: File | null = null;
  uploadProgress = 0;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(files: FileList): void {
    const file = files[0];

    if (file.size > this.maxSize) {
      this.uploadError.emit(`File size exceeds ${this.maxSize / 1024 / 1024}MB limit`);
      return;
    }

    if (!this.isFileTypeAllowed(file)) {
      this.uploadError.emit('File type not allowed');
      return;
    }

    this.currentFile = file;
    this.fileSelected.emit(file);
    this.uploadStarted.emit();
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      this.uploadProgress = progress;
      this.uploadProgress.emit(progress);

      if (progress >= 100) {
        clearInterval(interval);
        this.uploadCompleted.emit(file);
      }
    }, 500);
  }

  private isFileTypeAllowed(file: File): boolean {
    if (this.accept === '*/*') return true;
    
    const allowedTypes = this.accept.split(',').map(type => type.trim());
    const fileType = file.type;
    
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return fileType.startsWith(baseType);
      }
      return type === fileType;
    });
  }

  cancelUpload(): void {
    this.currentFile = null;
    this.uploadProgress = 0;
    this.uploadCancelled.emit();
  }
} 