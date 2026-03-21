import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  standalone: true,
  selector: 'app-toast-container',
  template: `
    <div class="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      @for (m of toast.messages(); track m.id) {
        <div
          class="pointer-events-auto rounded-xl border bg-white p-3 text-sm shadow-lg ring-1 ring-slate-900/5"
          [class.border-emerald-200]="m.variant === 'success'"
          [class.border-rose-200]="m.variant === 'error'"
          [class.border-slate-200]="m.variant === 'info'"
        >
          <div class="flex items-start justify-between gap-3">
            <p
              class="font-medium"
              [class.text-emerald-800]="m.variant === 'success'"
              [class.text-rose-800]="m.variant === 'error'"
              [class.text-slate-800]="m.variant === 'info'"
            >
              {{ m.text }}
            </p>
            <button
              type="button"
              class="rounded-md px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
              (click)="toast.dismiss(m.id)"
            >
              Dismiss
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toast = inject(ToastService);
}
