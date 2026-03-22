import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ReassessmentComparisonService } from '../../../services/reassessment-comparison.service';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { ReassessmentHeaderDeltaComponent } from '../../../components/risk-analysis/reassessment-header-delta/reassessment-header-delta.component';
import { ReassessmentScoreCardComponent } from '../../../components/risk-analysis/reassessment-score-card/reassessment-score-card.component';
import { ReassessmentTopicComparisonChartComponent } from '../../../components/risk-analysis/reassessment-topic-comparison-chart/reassessment-topic-comparison-chart.component';
import { ReassessmentTopicBreakdownTableComponent } from '../../../components/risk-analysis/reassessment-topic-breakdown-table/reassessment-topic-breakdown-table.component';
import { ReassessmentCertificateBannerComponent } from '../../../components/risk-analysis/reassessment-certificate-banner/reassessment-certificate-banner.component';

@Component({
  selector: 'app-reassessment-comparison',
  standalone: true,
  imports: [
    TopBarComponent,
    SidebarComponent,
    ReassessmentHeaderDeltaComponent,
    ReassessmentScoreCardComponent,
    ReassessmentTopicComparisonChartComponent,
    ReassessmentTopicBreakdownTableComponent,
    ReassessmentCertificateBannerComponent,
  ],
  templateUrl: './reassessment-comparison.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReassessmentComparisonComponent {
  protected readonly compSvc = inject(ReassessmentComparisonService);

  protected onGenerateCertificate(): void {
    this.compSvc.requestGenerateCertificate();
  }

  protected dismissCertificateNotice(): void {
    this.compSvc.clearCertificateNotice();
  }
}
