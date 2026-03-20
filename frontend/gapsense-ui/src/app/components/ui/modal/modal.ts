import { Component, input, output } from '@angular/core';

// reusable modal dialog - shows content in an overlay
// usage:
// <app-modal [isOpen]="showModal" title="Edit Question" (closed)="showModal = false">
//   <p>modal content here</p>
// </app-modal>
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html',
})
export class ModalComponent {
  // whether the modal is visible
  isOpen = input<boolean>(false);

  // modal title shown at the top
  title = input<string>('');

  // emitted when user closes the modal
  closed = output<void>();

  // close when clicking the backdrop
  onBackdropClick() {
    this.closed.emit();
  }

  // close when clicking the X button
  onClose() {
    this.closed.emit();
  }
}
