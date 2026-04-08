import { Component, input } from '@angular/core';

@Component({
  selector: 'app-threshold-summary-cards',
  standalone: true,
  templateUrl: './threshold-summary-cards.component.html',
  styleUrl: './threshold-summary-cards.component.css',
})
export class ThresholdSummaryCardsComponent {
  readonly activeCount = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly highRiskLabel = input<string>('< 50%');
  readonly lowRiskLabel = input<string>('> 75%');
  readonly highRiskPercent = input<number>(50);
  readonly lowRiskPercent = input<number>(75);
  readonly lastUpdated = input<string>('');
  readonly lastUpdatedBy = input<string>('Admin');
}
