import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { LearningPathStep } from '../../../models/risk-analysis/learning-path-step.model';

@Component({
  selector: 'app-learning-path-step-card',
  standalone: true,
  templateUrl: './learning-path-step-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningPathStepCardComponent {
  readonly step = input.required<LearningPathStep>();

  readonly viewPerformanceSummary = output<string>();
  readonly resumeResource = output<string>();

  protected statusBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-blue-100 text-blue-900';
      case 'in_progress':
        return 'bg-slate-200 text-slate-800';
      default:
        return 'bg-slate-200 text-slate-600';
    }
  }

  protected statusLabel(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  }
}
