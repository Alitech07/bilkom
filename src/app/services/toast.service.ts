import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts$ = new Subject<Toast>();

  success(message: string, duration = 3500): void {
    this.emit('success', message, duration);
  }

  error(message: string, duration = 4500): void {
    this.emit('error', message, duration);
  }

  info(message: string, duration = 3500): void {
    this.emit('info', message, duration);
  }

  warning(message: string, duration = 4000): void {
    this.emit('warning', message, duration);
  }

  showResult(res: { success: boolean; message?: string; warning?: boolean }, fallback = 'Xato'): void {
    if (res.success) this.emit('success', res.message ?? 'OK', 3500);
    else if (res.warning) this.emit('warning', res.message ?? fallback, 4000);
    else this.emit('error', res.message ?? fallback, 4500);
  }

  private emit(type: ToastType, message: string, duration: number): void {
    this.toasts$.next({ id: ++this.counter, type, message, duration });
  }
}
