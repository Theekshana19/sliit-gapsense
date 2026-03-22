import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { RiskInsight } from '../../../models/risk-analysis/risk-insight.model';

@Component({
  selector: 'app-risk-insight-card',
  standalone: true,
  templateUrl: './risk-insight-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskInsightCardComponent {
  readonly insight = input.required<RiskInsight>();
}
