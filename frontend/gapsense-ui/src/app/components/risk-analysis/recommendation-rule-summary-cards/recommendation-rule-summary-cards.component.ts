import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-recommendation-rule-summary-cards',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './recommendation-rule-summary-cards.component.html',
  styleUrl: './recommendation-rule-summary-cards.component.css',
})
export class RecommendationRuleSummaryCardsComponent {
  readonly activeImpact = input.required<number>();
  readonly efficiencyRate = input.required<number>();
  readonly criticalGaps = input.required<number>();
}
