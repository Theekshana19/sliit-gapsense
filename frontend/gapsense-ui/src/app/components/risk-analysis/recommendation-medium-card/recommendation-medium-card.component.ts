import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { MediumPriorityRecommendation } from '../../../models/risk-analysis/recommendation-medium-card.model';

@Component({
  selector: 'app-recommendation-medium-card',
  standalone: true,
  templateUrl: './recommendation-medium-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationMediumCardComponent {
  readonly recommendation = input.required<MediumPriorityRecommendation>();

  readonly openResource = output<MediumPriorityRecommendation>();

  protected onOpenResource(): void {
    this.openResource.emit(this.recommendation());
  }
}
