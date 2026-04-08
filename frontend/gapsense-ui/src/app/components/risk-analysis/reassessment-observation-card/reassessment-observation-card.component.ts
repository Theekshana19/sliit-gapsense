import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ReassessmentObservation } from '../../../models/risk-analysis/reassessment-observation.model';

@Component({
  selector: 'app-reassessment-observation-card',
  standalone: true,
  templateUrl: './reassessment-observation-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReassessmentObservationCardComponent {
  readonly observation = input.required<ReassessmentObservation>();
}
