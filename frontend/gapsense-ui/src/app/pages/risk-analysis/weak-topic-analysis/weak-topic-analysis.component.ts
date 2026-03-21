import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { WeakTopicAnalysisService } from '../../../services/weak-topic-analysis.service';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { WeakTopicFilterBarComponent } from '../../../components/risk-analysis/weak-topic-filter-bar/weak-topic-filter-bar.component';
import { WeakTopicSummaryCardsComponent } from '../../../components/risk-analysis/weak-topic-summary-cards/weak-topic-summary-cards.component';
import { WeakTopicMatrixTableComponent } from '../../../components/risk-analysis/weak-topic-matrix-table/weak-topic-matrix-table.component';
import { WeakTopicInterventionStrategyComponent } from '../../../components/risk-analysis/weak-topic-intervention-strategy/weak-topic-intervention-strategy.component';
import { WeakTopicProjectionPanelComponent } from '../../../components/risk-analysis/weak-topic-projection-panel/weak-topic-projection-panel.component';

@Component({
  selector: 'app-weak-topic-analysis',
  standalone: true,
  imports: [
    TopBarComponent,
    SidebarComponent,
    WeakTopicFilterBarComponent,
    WeakTopicSummaryCardsComponent,
    WeakTopicMatrixTableComponent,
    WeakTopicInterventionStrategyComponent,
    WeakTopicProjectionPanelComponent,
  ],
  templateUrl: './weak-topic-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeakTopicAnalysisComponent implements OnInit {
  protected readonly analysisSvc = inject(WeakTopicAnalysisService);

  ngOnInit(): void {
    this.analysisSvc.initDefaults();
  }

  protected onExportMatrixPdf(): void {
    this.analysisSvc.requestExportDetailedPdf();
  }

  protected onDeployRecommendations(): void {
    this.analysisSvc.requestDeployRecommendations();
  }

  protected dismissExportNotice(): void {
    this.analysisSvc.clearExportNotice();
  }

  protected dismissDeployNotice(): void {
    this.analysisSvc.clearDeployNotice();
  }
}
