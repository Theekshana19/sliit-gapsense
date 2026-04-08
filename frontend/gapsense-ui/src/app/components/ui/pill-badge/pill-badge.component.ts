import { Component, computed, input } from '@angular/core';

/** Generic label badge for curriculum/readiness UIs (Sewwandi-style). Not the risk-threshold status badge. */
@Component({
  selector: 'app-pill-badge',
  standalone: true,
  templateUrl: './pill-badge.component.html',
})
export class PillBadgeComponent {
  label = input.required<string>();
  variant = input<'primary' | 'error' | 'neutral' | 'success'>('primary');
  showDot = input<boolean>(false);

  badgeClasses = computed(() => {
    const base =
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider';
    switch (this.variant()) {
      case 'primary':
        return `${base} bg-blue-100 text-blue-900`;
      case 'error':
        return `${base} bg-red-100 text-red-900`;
      case 'neutral':
        return `${base} bg-slate-200 text-slate-700`;
      case 'success':
        return `${base} bg-emerald-100 text-emerald-900`;
      default:
        return `${base} bg-slate-200 text-slate-700`;
    }
  });

  dotClasses = computed(() => {
    switch (this.variant()) {
      case 'primary':
        return 'h-1.5 w-1.5 rounded-full bg-blue-600';
      case 'error':
        return 'h-1.5 w-1.5 rounded-full bg-red-600';
      case 'success':
        return 'h-1.5 w-1.5 rounded-full bg-emerald-600';
      default:
        return 'h-1.5 w-1.5 rounded-full bg-slate-500';
    }
  });
}
