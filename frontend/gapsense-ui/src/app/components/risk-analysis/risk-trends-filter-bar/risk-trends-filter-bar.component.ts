import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RiskTrendsSummaryService } from '../../../services/risk-trends-summary.service';
import type { RiskTrendFilterOption } from '../../../models/risk-analysis/risk-trend-filter.model';

@Component({
  selector: 'app-risk-trends-filter-bar',
  standalone: true,
  templateUrl: './risk-trends-filter-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskTrendsFilterBarComponent {
  protected readonly svc = inject(RiskTrendsSummaryService);

  readonly advancedFilters = output<void>();

  protected onModuleChange(id: string): void {
    this.svc.setModuleId(id);
  }

  protected onBatchChange(id: string): void {
    this.svc.setBatchId(id);
  }

  protected onSemesterChange(id: string): void {
    this.svc.setSemesterId(id);
  }
}
