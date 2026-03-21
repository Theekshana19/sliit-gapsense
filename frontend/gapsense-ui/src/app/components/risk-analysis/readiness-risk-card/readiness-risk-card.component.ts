import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ReadinessRiskSummary } from '../../../models/risk-analysis/readiness-result.model';

@Component({
  selector: 'app-readiness-risk-card',
  standalone: true,
  templateUrl: './readiness-risk-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadinessRiskCardComponent {
  readonly risk = input.required<ReadinessRiskSummary>();

  protected readonly badgeLabel = computed(() => {
    switch (this.risk().level) {
      case 'high':
        return 'High Risk';
      case 'medium':
        return 'Medium Risk';
      default:
        return 'Low Risk';
    }
  });

  protected readonly badgeClasses = computed(() => {
    switch (this.risk().level) {
      case 'high':
        return 'bg-red-100 text-red-900 border border-red-200/80';
      case 'medium':
        return 'bg-amber-100 text-amber-900 border border-amber-200/80';
      default:
        return 'bg-emerald-100 text-emerald-900 border border-emerald-200/80';
    }
  });

  protected readonly dotClass = computed(() => {
    switch (this.risk().level) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-amber-500';
      default:
        return 'bg-emerald-600';
    }
  });

  protected readonly iconClass = computed(() => {
    switch (this.risk().level) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      default:
        return 'text-emerald-600';
    }
  });
}
