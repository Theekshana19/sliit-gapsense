import { Component, input, output } from '@angular/core';

// Template-driven confirm (curriculum/readiness pages). Tharindu monitoring uses ConfirmService + app-confirm-dialog overlay.
@Component({
  selector: 'app-confirm-prompt',
  standalone: true,
  templateUrl: './confirm-prompt-dialog.html',
})
export class ConfirmPromptDialogComponent {
  isOpen = input<boolean>(false);
  title = input<string>('Confirm Action');
  message = input<string>('Are you sure you want to proceed?');
  icon = input<string>('warning');
  confirmLabel = input<string>('Confirm');
  cancelLabel = input<string>('Cancel');
  danger = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
