import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { LearningPathStep } from '../../../models/risk-analysis/learning-path-step.model';
import { LearningPathStepCardComponent } from '../learning-path-step-card/learning-path-step-card.component';

@Component({
  selector: 'app-learning-path-timeline',
  standalone: true,
  imports: [LearningPathStepCardComponent],
  templateUrl: './learning-path-timeline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningPathTimelineComponent {
  readonly steps = input.required<LearningPathStep[]>();

  readonly viewPerformanceSummary = output<string>();
  readonly resumeResource = output<string>();
}
