import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { ReadinessResultService } from '../../../services/readiness-result.service';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { ReadinessStudentCardComponent } from '../../../components/risk-analysis/readiness-student-card/readiness-student-card.component';
import { ReadinessInterpretationAlertComponent } from '../../../components/risk-analysis/readiness-interpretation-alert/readiness-interpretation-alert.component';
import { ReadinessScoreCardComponent } from '../../../components/risk-analysis/readiness-score-card/readiness-score-card.component';
import { ReadinessRiskCardComponent } from '../../../components/risk-analysis/readiness-risk-card/readiness-risk-card.component';
import { ReadinessWeakTopicsCardComponent } from '../../../components/risk-analysis/readiness-weak-topics-card/readiness-weak-topics-card.component';
import { ReadinessActionPlanCardComponent } from '../../../components/risk-analysis/readiness-action-plan-card/readiness-action-plan-card.component';
import { ReadinessTopicPerformanceComponent } from '../../../components/risk-analysis/readiness-topic-performance/readiness-topic-performance.component';
import { ReadinessExportActionsComponent } from '../../../components/risk-analysis/readiness-export-actions/readiness-export-actions.component';

@Component({
  selector: 'app-readiness-result',
  standalone: true,
  imports: [
    TopBarComponent,
    SidebarComponent,
    ReadinessStudentCardComponent,
    ReadinessInterpretationAlertComponent,
    ReadinessScoreCardComponent,
    ReadinessRiskCardComponent,
    ReadinessWeakTopicsCardComponent,
    ReadinessActionPlanCardComponent,
    ReadinessTopicPerformanceComponent,
    ReadinessExportActionsComponent,
  ],
  templateUrl: './readiness-result.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadinessResultComponent implements OnInit {
  protected readonly readiness = inject(ReadinessResultService);

  ngOnInit(): void {
    void this.readiness.loadFromApi();
  }

  protected async onExportPdf(): Promise<void> {
    await this.readiness.exportPdf();
  }

  protected onShareReport(): void {
    this.readiness.shareReportPlaceholder();
  }
}
