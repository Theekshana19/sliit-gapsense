import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-modal',
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          (click)="backdropClose.emit()"
          role="presentation"
        ></div>
        <div
          class="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          role="dialog"
          aria-modal="true"
        >
          <div class="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
              @if (description) {
                <p class="mt-1 text-sm text-slate-600">{{ description }}</p>
              }
            </div>
            <button
              type="button"
              class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              (click)="close.emit()"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() description = '';
  @Output() close = new EventEmitter<void>();
  @Output() backdropClose = new EventEmitter<void>();
}
