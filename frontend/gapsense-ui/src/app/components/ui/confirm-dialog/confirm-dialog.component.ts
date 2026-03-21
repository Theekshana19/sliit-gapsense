import { Component, inject } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  standalone: true,
  selector: 'app-confirm-dialog',
  template: `
    @if (confirm.dialog(); as d) {
      <div class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/50" role="presentation"></div>
        <div
          class="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          role="alertdialog"
          aria-modal="true"
        >
          <h2 class="text-base font-semibold text-slate-900">{{ d.title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ d.message }}</p>
          <div class="mt-6 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              (click)="confirm.respond(false)"
            >
              {{ d.cancelLabel }}
            </button>
            <button
              type="button"
              class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              (click)="confirm.respond(true)"
            >
              {{ d.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly confirm = inject(ConfirmService);
}
