import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ReassessmentScoreSummary } from '../../../models/risk-analysis/reassessment-score-summary.model';

@Component({
  selector: 'app-reassessment-score-card',
  standalone: true,
  templateUrl: './reassessment-score-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReassessmentScoreCardComponent {
  readonly summary = input.required<ReassessmentScoreSummary>();

  protected riskBadgeClass(): string {
    return this.summary().isHighRisk
      ? 'bg-red-100 text-red-800'
      : 'bg-blue-800 text-white';
  }

  protected riskIcon(): string {
    return this.summary().isHighRisk ? 'warning' : 'check_circle';
  }

  protected labelPillClass(): string {
    return this.summary().isHighRisk
      ? 'bg-slate-200 text-slate-600'
      : 'bg-blue-100 text-blue-900';
  }
}
