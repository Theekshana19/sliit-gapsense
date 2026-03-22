import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { PrioritySectionConfig } from '../../../models/risk-analysis/recommendation-priority-group.model';

@Component({
  selector: 'app-recommendations-priority-section',
  standalone: true,
  templateUrl: './recommendations-priority-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsPrioritySectionComponent {
  readonly config = input.required<PrioritySectionConfig>();

  protected badgeClass(tone: string): string {
    return tone === 'error'
      ? 'bg-red-100 text-red-800'
      : 'bg-blue-100 text-blue-900';
  }
}
