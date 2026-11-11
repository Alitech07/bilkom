import { Component, OnDestroy, OnInit } from '@angular/core';
import { Toast, ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: (Toast & { closing?: boolean })[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe(toast => {
      this.toasts.push({ ...toast });
      setTimeout(() => this.close(toast.id), toast.duration);
    });
  }

  close(id: number): void {
    const t = this.toasts.find(x => x.id === id);
    if (!t || t.closing) return;
    t.closing = true;
    setTimeout(() => {
      this.toasts = this.toasts.filter(x => x.id !== id);
    }, 320);
  }

  icon(type: string): string {
    return { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' }[type] ?? 'info';
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
