import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { RecommendationInsightView } from '../../../models/risk-analysis/recommendation-insight.model';

@Component({
  selector: 'app-recommendations-insight-panel',
  standalone: true,
  templateUrl: './recommendations-insight-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsInsightPanelComponent {
  readonly insight = input.required<RecommendationInsightView>();
}
