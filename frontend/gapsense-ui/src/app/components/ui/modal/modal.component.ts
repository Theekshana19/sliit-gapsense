import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  readonly title = input<string>('Confirm');
  readonly message = input<string>('');
  readonly confirmText = input<string>('Confirm');
  readonly confirmVariant = input<'primary' | 'error'>('error');
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
