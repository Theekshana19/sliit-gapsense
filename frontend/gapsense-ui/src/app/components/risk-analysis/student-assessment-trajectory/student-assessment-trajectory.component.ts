import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { AssessmentTrajectoryItemView } from '../../../models/risk-analysis/assessment-trajectory-item.model';

@Component({
  selector: 'app-student-assessment-trajectory',
  standalone: true,
  templateUrl: './student-assessment-trajectory.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentAssessmentTrajectoryComponent {
  readonly items = input.required<AssessmentTrajectoryItemView[]>();
  readonly canNavigatePrev = input(false);
  readonly canNavigateNext = input(false);

  readonly navigatePrev = output<void>();
  readonly navigateNext = output<void>();

  protected outcomeBadgeClass(outcome: string): string {
    switch (outcome) {
      case 'ready':
        return 'bg-blue-100 text-blue-900';
      case 'not_ready':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-200 text-slate-600';
    }
  }

  protected outcomeLabel(outcome: string): string {
    switch (outcome) {
      case 'ready':
        return 'READY';
      case 'not_ready':
        return 'NOT READY';
      default:
        return 'MARGINAL';
    }
  }

  protected trendClass(direction: string): string {
    return direction === 'up' ? 'text-green-600' : 'text-red-600';
  }
}
