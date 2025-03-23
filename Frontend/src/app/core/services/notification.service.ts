import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private duration = 5000; // Default duration in milliseconds

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Display a success message
   * @param message Message to display
   * @param duration Optional custom duration in milliseconds
   */
  success(message: string, duration?: number): void {
    this.snackBar.open(message, 'Close', {
      duration: duration || this.duration,
      panelClass: ['bg-green-700', 'text-white']
    });
  }

  /**
   * Display an error message
   * @param message Message to display
   * @param duration Optional custom duration in milliseconds
   */
  error(message: string, duration?: number): void {
    this.snackBar.open(message, 'Close', {
      duration: duration || this.duration,
      panelClass: ['bg-red-700', 'text-white']
    });
  }

  /**
   * Display a warning message
   * @param message Message to display
   * @param duration Optional custom duration in milliseconds
   */
  warning(message: string, duration?: number): void {
    this.snackBar.open(message, 'Close', {
      duration: duration || this.duration,
      panelClass: ['bg-yellow-700', 'text-white']
    });
  }

  /**
   * Display an info message
   * @param message Message to display
   * @param duration Optional custom duration in milliseconds
   */
  info(message: string, duration?: number): void {
    this.snackBar.open(message, 'Close', {
      duration: duration || this.duration,
      panelClass: ['bg-blue-700', 'text-white']
    });
  }
} 