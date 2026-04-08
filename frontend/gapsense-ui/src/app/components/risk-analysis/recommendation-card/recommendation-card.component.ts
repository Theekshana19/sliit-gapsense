import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { HighPriorityRecommendation } from '../../../models/risk-analysis/personalized-recommendation.model';

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  templateUrl: './recommendation-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationCardComponent {
  readonly recommendation = input.required<HighPriorityRecommendation>();

  readonly viewResource = output<HighPriorityRecommendation>();

  protected statusBadgeClass(status: string): string {
    return status === 'completed'
      ? 'bg-blue-100 text-blue-900'
      : 'bg-slate-200 text-slate-600';
  }

  protected onViewResource(): void {
    this.viewResource.emit(this.recommendation());
  }
}
