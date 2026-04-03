import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RiskTrendsSummaryService } from '../../../services/risk-trends-summary.service';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { RiskTrendsHeaderActionsComponent } from '../../../components/risk-analysis/risk-trends-header-actions/risk-trends-header-actions.component';
import { RiskTrendsFilterBarComponent } from '../../../components/risk-analysis/risk-trends-filter-bar/risk-trends-filter-bar.component';
import { RiskSummaryMetricsGridComponent } from '../../../components/risk-analysis/risk-summary-metrics-grid/risk-summary-metrics-grid.component';
import { RiskDistributionCardComponent } from '../../../components/risk-analysis/risk-distribution-card/risk-distribution-card.component';
import { WeakTopicFrequencyCardComponent } from '../../../components/risk-analysis/weak-topic-frequency-card/weak-topic-frequency-card.component';
import { RiskProgressionTrendCardComponent } from '../../../components/risk-analysis/risk-progression-trend-card/risk-progression-trend-card.component';
import { RiskTrendsFabComponent } from '../../../components/risk-analysis/risk-trends-fab/risk-trends-fab.component';

@Component({
  selector: 'app-risk-trends-summary',
  standalone: true,
  imports: [
    TopBarComponent,
    SidebarComponent,
    RiskTrendsHeaderActionsComponent,
    RiskTrendsFilterBarComponent,
    RiskSummaryMetricsGridComponent,
    RiskDistributionCardComponent,
    WeakTopicFrequencyCardComponent,
    RiskProgressionTrendCardComponent,
    RiskTrendsFabComponent,
  ],
  templateUrl: './risk-trends-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskTrendsSummaryComponent implements OnInit {
  protected readonly svc = inject(RiskTrendsSummaryService);

  ngOnInit(): void {
    void this.svc.tryLoadFromApi();
  }

  protected onExportPdf(): void {
    this.svc.requestExportPdf();
  }

  protected onShareInsight(): void {
    this.svc.requestShareInsight();
  }

  protected dismissExportNotice(): void {
    this.svc.clearExportNotice();
  }

  protected dismissShareNotice(): void {
    this.svc.clearShareNotice();
  }

  protected onAdvancedFilters(): void {
    // Placeholder: future advanced filter modal
  }

  protected onPeriodChange(p: 'week' | 'month'): void {
    this.svc.setPeriod(p);
  }

  protected onFabClick(): void {
    // Placeholder: future FAB action
  }
}
