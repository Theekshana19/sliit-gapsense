import { Component, input, output } from '@angular/core';

// confirm dialog - asks user "are you sure?" before doing something
// usage:
// <app-confirm-dialog
//   [isOpen]="showDeleteDialog"
//   title="Delete Question"
//   message="Are you sure you want to delete this question? This cannot be undone."
//   confirmLabel="Delete"
//   (confirmed)="onDelete()"
//   (cancelled)="showDeleteDialog = false"
// />
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialogComponent {
  // whether the dialog is visible
  isOpen = input<boolean>(false);

  // dialog title
  title = input<string>('Confirm Action');

  // the warning message
  message = input<string>('Are you sure you want to proceed?');

  // icon to show (default is warning)
  icon = input<string>('warning');

  // text on the confirm button
  confirmLabel = input<string>('Confirm');

  // text on the cancel button
  cancelLabel = input<string>('Cancel');

  // is this a dangerous action? (shows red confirm button)
  danger = input<boolean>(false);

  // emitted when user clicks confirm
  confirmed = output<void>();

  // emitted when user clicks cancel or backdrop
  cancelled = output<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
