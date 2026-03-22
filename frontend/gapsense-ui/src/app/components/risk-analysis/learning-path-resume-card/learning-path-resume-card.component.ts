import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { LearningPathResumeItem } from '../../../models/risk-analysis/learning-path-resource.model';

@Component({
  selector: 'app-learning-path-resume-card',
  standalone: true,
  templateUrl: './learning-path-resume-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningPathResumeCardComponent {
  readonly item = input.required<LearningPathResumeItem>();

  readonly continue = output<void>();
}
