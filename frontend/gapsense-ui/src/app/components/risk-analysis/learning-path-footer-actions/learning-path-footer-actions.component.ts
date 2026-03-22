import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { LearningPathFooterAction } from '../../../models/risk-analysis/learning-path-footer-action.model';

@Component({
  selector: 'app-learning-path-footer-actions',
  standalone: true,
  templateUrl: './learning-path-footer-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningPathFooterActionsComponent {
  readonly config = input.required<LearningPathFooterAction>();

  readonly downloadPdf = output<void>();
  readonly retakeTest = output<void>();
}
