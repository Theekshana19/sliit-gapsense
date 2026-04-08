import { Component, computed, input, output } from '@angular/core';
import type { RiskThreshold } from '../../../models/risk-analysis/risk-threshold.model';
import {
  formatHighRiskRange,
  formatLowRiskRange,
  formatMediumRiskRange,
} from '../../../models/risk-analysis/risk-threshold.model';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../ui/status-badge/status-badge.component';

@Component({
  selector: 'app-threshold-table',
  standalone: true,
  imports: [EmptyStateComponent, StatusBadgeComponent],
  templateUrl: './threshold-table.component.html',
  styleUrl: './threshold-table.component.css',
})
export class ThresholdTableComponent {
  readonly rows = input.required<RiskThreshold[]>();
  readonly page = input<number>(1);
  readonly pageSize = input<number>(10);
  readonly total = input<number>(0);

  readonly edit = output<RiskThreshold>();
  readonly delete = output<RiskThreshold>();
  readonly pageChange = output<number>();

  protected formatLow = formatLowRiskRange;
  protected formatMedium = formatMediumRiskRange;
  protected formatHigh = formatHighRiskRange;

  protected startIndex = computed(() => {
    const p = this.page() ?? 1;
    const size = this.pageSize() ?? 10;
    const t = this.total();
    if (t === 0) return 0;
    return (p - 1) * size + 1;
  });

  protected endIndex = computed(() => {
    const t = this.total();
    const p = this.page() ?? 1;
    const size = this.pageSize() ?? 10;
    return Math.min(p * size, t);
  });

  protected totalPages = computed(() =>
    Math.max(1, Math.ceil((this.total() || 0) / (this.pageSize() ?? 10)))
  );

  protected pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );
}
