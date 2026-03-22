import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TopicMasteryItemView } from '../../../models/risk-analysis/topic-mastery-item.model';

@Component({
  selector: 'app-student-topic-mastery-overview',
  standalone: true,
  templateUrl: './student-topic-mastery-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentTopicMasteryOverviewComponent {
  readonly overallPercent = input.required<number>();
  readonly proficientLabel = input.required<string>();
  readonly lastAssessmentText = input.required<string>();
  readonly items = input.required<TopicMasteryItemView[]>();

  protected barColorClass(color: string): string {
    switch (color) {
      case 'error':
        return 'bg-red-600';
      case 'secondary':
        return 'bg-slate-600';
      default:
        return 'bg-blue-800';
    }
  }

  protected textColorClass(color: string): string {
    switch (color) {
      case 'error':
        return 'text-red-600';
      case 'secondary':
        return 'text-slate-600';
      default:
        return 'text-blue-800';
    }
  }

  /** SVG circle: circumference = 2 * pi * 80 = ~502.4. dashoffset = circumference * (1 - percent/100) */
  protected dashOffset(percent: number): number {
    const circumference = 2 * Math.PI * 80;
    return circumference * (1 - percent / 100);
  }
}
