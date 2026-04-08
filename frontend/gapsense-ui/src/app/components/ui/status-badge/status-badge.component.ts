import { Component, input } from '@angular/core';
import type { RiskThresholdStatus } from '../../../models/risk-analysis/risk-threshold.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  readonly status = input.required<RiskThresholdStatus>();
}
