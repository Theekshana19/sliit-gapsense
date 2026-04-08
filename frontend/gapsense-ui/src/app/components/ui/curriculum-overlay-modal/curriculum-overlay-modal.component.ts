import { Component, input, output } from '@angular/core';

/** Sewwandi-style overlay modal (ng-content). Kept separate from app-modal confirm dialog. */
@Component({
  selector: 'app-curriculum-overlay-modal',
  standalone: true,
  templateUrl: './curriculum-overlay-modal.component.html',
})
export class CurriculumOverlayModalComponent {
  isOpen = input<boolean>(false);
  title = input<string>('');
  closed = output<void>();

  onBackdropClick(): void {
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }
}
