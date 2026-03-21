import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-loading-spinner',
  template: `
    <div class="flex items-center gap-2 text-sm text-slate-600" [class.opacity-60]="muted">
      <span
        class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
        aria-hidden="true"
      ></span>
      @if (label) {
        <span>{{ label }}</span>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() label = '';
  @Input() muted = false;
}
