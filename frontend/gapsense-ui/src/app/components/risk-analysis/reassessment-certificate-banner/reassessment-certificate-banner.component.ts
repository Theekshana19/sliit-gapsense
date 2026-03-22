import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { ReadinessCertificateAction } from '../../../models/risk-analysis/readiness-certificate-action.model';

@Component({
  selector: 'app-reassessment-certificate-banner',
  standalone: true,
  templateUrl: './reassessment-certificate-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReassessmentCertificateBannerComponent {
  readonly config = input.required<ReadinessCertificateAction>();

  readonly generate = output<void>();
}
