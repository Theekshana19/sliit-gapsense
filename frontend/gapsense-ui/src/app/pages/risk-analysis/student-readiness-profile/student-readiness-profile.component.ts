import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { StudentReadinessProfileService } from '../../../services/student-readiness-profile.service';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { AppFooterComponent } from '../../../components/layout/app-footer/app-footer.component';
import { StudentProfileFilterBarComponent } from '../../../components/risk-analysis/student-profile-filter-bar/student-profile-filter-bar.component';
import { StudentProfileHeaderActionsComponent } from '../../../components/risk-analysis/student-profile-header-actions/student-profile-header-actions.component';
import { StudentProfileSummaryCardComponent } from '../../../components/risk-analysis/student-profile-summary-card/student-profile-summary-card.component';
import { StudentRiskLevelCardComponent } from '../../../components/risk-analysis/student-risk-level-card/student-risk-level-card.component';
import { StudentAcademicCredentialsComponent } from '../../../components/risk-analysis/student-academic-credentials/student-academic-credentials.component';
import { StudentTopicMasteryOverviewComponent } from '../../../components/risk-analysis/student-topic-mastery-overview/student-topic-mastery-overview.component';
import { StudentAssessmentTrajectoryComponent } from '../../../components/risk-analysis/student-assessment-trajectory/student-assessment-trajectory.component';

@Component({
  selector: 'app-student-readiness-profile',
  standalone: true,
  imports: [
    TopBarComponent,
    SidebarComponent,
    AppFooterComponent,
    StudentProfileFilterBarComponent,
    StudentProfileHeaderActionsComponent,
    StudentProfileSummaryCardComponent,
    StudentRiskLevelCardComponent,
    StudentAcademicCredentialsComponent,
    StudentTopicMasteryOverviewComponent,
    StudentAssessmentTrajectoryComponent,
  ],
  templateUrl: './student-readiness-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentReadinessProfileComponent implements OnInit {
  protected readonly profileSvc = inject(StudentReadinessProfileService);

  ngOnInit(): void {
    this.profileSvc.initDefaults();
    void this.profileSvc.tryLoadFromApi();
  }

  protected onExportPdf(): void {
    this.profileSvc.requestExportPdf();
  }

  protected onNotifyStudent(): void {
    this.profileSvc.requestNotifyStudent();
  }

  protected onNavigatePrev(): void {
    this.profileSvc.navigateTrajectoryPrev();
  }

  protected onNavigateNext(): void {
    this.profileSvc.navigateTrajectoryNext();
  }

  protected dismissExportNotice(): void {
    this.profileSvc.clearExportNotice();
  }

  protected dismissNotifyNotice(): void {
    this.profileSvc.clearNotifyNotice();
  }
}
