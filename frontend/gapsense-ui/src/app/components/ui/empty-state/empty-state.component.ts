import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-empty-state',
  template: `
    <div
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center"
    >
      <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        <span class="text-lg" aria-hidden="true">📭</span>
      </div>
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
      <p class="mt-1 max-w-md text-sm text-slate-600">{{ message }}</p>
      @if (actionLabel) {
        <ng-content />
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input() message = '';
  @Input() actionLabel = '';
}
