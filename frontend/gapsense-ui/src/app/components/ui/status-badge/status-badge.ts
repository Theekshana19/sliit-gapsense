import { Component, input, computed } from '@angular/core';

// color-coded status badge / pill
// usage: <app-status-badge label="Active" variant="primary" />
// variants: primary (blue), error (red), neutral (gray), success (teal)
@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
})
export class StatusBadgeComponent {
  // the text shown inside the badge
  label = input.required<string>();

  // which color style to use
  variant = input<'primary' | 'error' | 'neutral' | 'success'>('primary');

  // show a small dot before the label (like in submission tracking)
  showDot = input<boolean>(false);

  // compute the css classes based on the variant
  badgeClasses = computed(() => {
    const base = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider';

    switch (this.variant()) {
      case 'primary':
        return `${base} bg-primary-fixed text-on-primary-fixed-variant`;
      case 'error':
        return `${base} bg-error-container text-on-error-container`;
      case 'neutral':
        return `${base} bg-surface-container-high text-on-surface-variant`;
      case 'success':
        return `${base} bg-tertiary-fixed text-on-tertiary-fixed-variant`;
      default:
        return `${base} bg-surface-container-high text-on-surface-variant`;
    }
  });

  // dot color matches the variant
  dotClasses = computed(() => {
    switch (this.variant()) {
      case 'primary':
        return 'w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot';
      case 'error':
        return 'w-1.5 h-1.5 rounded-full bg-error animate-pulse-dot';
      case 'success':
        return 'w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse-dot';
      default:
        return 'w-1.5 h-1.5 rounded-full bg-on-surface-variant';
    }
  });
}
