import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { RiskSummaryMetric } from '../../../models/risk-analysis/risk-summary-metric.model';

@Component({
  selector: 'app-risk-summary-metrics-grid',
  standalone: true,
  templateUrl: './risk-summary-metrics-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskSummaryMetricsGridComponent {
  readonly metrics = input.required<RiskSummaryMetric[]>();

  protected accentClass(accent: string): string {
    switch (accent) {
      case 'error':
        return 'border-l-red-600';
      case 'secondary':
        return 'border-l-slate-500';
      default:
        return 'border-l-blue-800';
    }
  }

  protected badgeClass(style?: string): string {
    switch (style) {
      case 'positive':
        return 'bg-blue-100 text-blue-900';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  }

  protected valueClass(accent: string): string {
    return accent === 'error' ? 'text-red-600' : 'text-slate-900';
  }
}
