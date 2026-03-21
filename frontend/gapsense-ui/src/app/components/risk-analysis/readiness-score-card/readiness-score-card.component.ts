import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ReadinessScoreSummary } from '../../../models/risk-analysis/readiness-result.model';

@Component({
  selector: 'app-readiness-score-card',
  standalone: true,
  templateUrl: './readiness-score-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadinessScoreCardComponent {
  readonly score = input.required<ReadinessScoreSummary>();

  protected readonly barClass = computed(() => {
    const tone = this.score().barTone ?? 'neutral';
    switch (tone) {
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-amber-500';
      case 'success':
        return 'bg-emerald-600';
      default:
        return 'bg-slate-500';
    }
  });
}
