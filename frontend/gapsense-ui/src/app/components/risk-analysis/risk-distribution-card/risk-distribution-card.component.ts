import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { RiskDistribution } from '../../../models/risk-analysis/risk-distribution.model';

@Component({
  selector: 'app-risk-distribution-card',
  standalone: true,
  templateUrl: './risk-distribution-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskDistributionCardComponent {
  readonly distribution = input.required<RiskDistribution>();

  private readonly circumference = 2 * Math.PI * 60;

  protected segmentDashArray(percent: number): string {
    const dash = (this.circumference * percent) / 100;
    return `${dash} 500`;
  }

  protected segmentOffset(percentSoFar: number): number {
    return (this.circumference * percentSoFar) / 100;
  }

  protected segmentColor(key: string): string {
    switch (key) {
      case 'low':
        return '#1e3a8a';
      case 'medium':
        return '#60a5fa';
      case 'high':
        return '#dc2626';
      default:
        return '#94a3b8';
    }
  }
}
