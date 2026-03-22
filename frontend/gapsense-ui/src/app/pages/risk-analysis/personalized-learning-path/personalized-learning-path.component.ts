import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { PersonalizedLearningPathService } from '../../../services/personalized-learning-path.service';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { LearningPathSummaryCardComponent } from '../../../components/risk-analysis/learning-path-summary-card/learning-path-summary-card.component';
import { LearningPathResumeCardComponent } from '../../../components/risk-analysis/learning-path-resume-card/learning-path-resume-card.component';
import { LearningPathTimelineComponent } from '../../../components/risk-analysis/learning-path-timeline/learning-path-timeline.component';
import { LearningPathFooterActionsComponent } from '../../../components/risk-analysis/learning-path-footer-actions/learning-path-footer-actions.component';
import { LearningPathFabComponent } from '../../../components/risk-analysis/learning-path-fab/learning-path-fab.component';

@Component({
  selector: 'app-personalized-learning-path',
  standalone: true,
  imports: [
    TopBarComponent,
    SidebarComponent,
    LearningPathSummaryCardComponent,
    LearningPathResumeCardComponent,
    LearningPathTimelineComponent,
    LearningPathFooterActionsComponent,
    LearningPathFabComponent,
  ],
  templateUrl: './personalized-learning-path.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalizedLearningPathComponent {
  protected readonly pathSvc = inject(PersonalizedLearningPathService);

  protected onContinueLearning(): void {
    this.pathSvc.continueLearning();
  }

  protected onViewPerformanceSummary(stepId: string): void {
    this.pathSvc.viewPerformanceSummary(stepId);
  }

  protected onResumeResource(stepId: string): void {
    this.pathSvc.resumeResource(stepId);
  }

  protected onDownloadPdf(): void {
    this.pathSvc.requestDownloadPdfPath();
  }

  protected onRetakeTest(): void {
    this.pathSvc.requestRetakeReadinessTest();
  }

  protected onFabHelp(): void {
    // Placeholder: open help modal
  }

  protected dismissDownloadNotice(): void {
    this.pathSvc.clearDownloadPdfNotice();
  }

  protected dismissRetakeNotice(): void {
    this.pathSvc.clearRetakeNotice();
  }
}
