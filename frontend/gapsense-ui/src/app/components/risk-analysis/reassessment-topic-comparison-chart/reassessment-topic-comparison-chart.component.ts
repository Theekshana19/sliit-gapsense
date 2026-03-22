import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ReassessmentTopicComparison } from '../../../models/risk-analysis/reassessment-topic-comparison.model';

@Component({
  selector: 'app-reassessment-topic-comparison-chart',
  standalone: true,
  templateUrl: './reassessment-topic-comparison-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReassessmentTopicComparisonChartComponent {
  readonly items = input.required<ReassessmentTopicComparison[]>();
}
