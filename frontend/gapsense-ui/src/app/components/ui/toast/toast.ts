import { Component, inject } from '@angular/core';
import { ToastService } from '../../../services/toast.service';

// toast notification component - shows messages at bottom right
// this component reads from ToastService and displays all active toasts
// usage: just add <app-toast /> once in app.html, then use ToastService anywhere
@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
})
export class ToastComponent {
  toastService = inject(ToastService);

  // get the icon for each toast type
  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  // get background color class for each toast type
  getBgClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-primary text-on-primary';
      case 'error':
        return 'bg-error text-on-error';
      case 'info':
        return 'bg-inverse-surface text-inverse-on-surface';
      default:
        return 'bg-inverse-surface text-inverse-on-surface';
    }
  }
}
