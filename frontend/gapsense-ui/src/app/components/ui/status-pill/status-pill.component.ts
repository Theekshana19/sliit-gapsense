import { Component, Input } from '@angular/core';

export type StatusPillTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

@Component({
  standalone: true,
  selector: 'app-status-pill',
  template: `
    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset" [class]="pillClass">
      {{ label }}
    </span>
  `,
})
export class StatusPillComponent {
  @Input({ required: true }) label!: string;
  @Input() tone: StatusPillTone = 'neutral';

  get pillClass(): string {
    const map: Record<StatusPillTone, string> = {
      success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      warning: 'bg-amber-50 text-amber-800 ring-amber-600/20',
      danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
      neutral: 'bg-slate-50 text-slate-700 ring-slate-600/10',
      info: 'bg-sky-50 text-sky-800 ring-sky-600/20',
    };
    return map[this.tone];
  }
}
