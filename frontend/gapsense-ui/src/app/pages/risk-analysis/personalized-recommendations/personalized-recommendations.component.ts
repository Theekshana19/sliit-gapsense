import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { PersonalizedRecommendationsService } from '../../../services/personalized-recommendations.service';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { RecommendationsHeaderActionsComponent } from '../../../components/risk-analysis/recommendations-header-actions/recommendations-header-actions.component';
import { RecommendationsPrioritySectionComponent } from '../../../components/risk-analysis/recommendations-priority-section/recommendations-priority-section.component';
import { RecommendationCardComponent } from '../../../components/risk-analysis/recommendation-card/recommendation-card.component';
import { RecommendationMediumCardComponent } from '../../../components/risk-analysis/recommendation-medium-card/recommendation-medium-card.component';
import { RecommendationsInsightPanelComponent } from '../../../components/risk-analysis/recommendations-insight-panel/recommendations-insight-panel.component';
import { RecommendationsRoadmapPanelComponent } from '../../../components/risk-analysis/recommendations-roadmap-panel/recommendations-roadmap-panel.component';

@Component({
  selector: 'app-personalized-recommendations',
  standalone: true,
  imports: [
    TopBarComponent,
    SidebarComponent,
    RecommendationsHeaderActionsComponent,
    RecommendationsPrioritySectionComponent,
    RecommendationCardComponent,
    RecommendationMediumCardComponent,
    RecommendationsInsightPanelComponent,
    RecommendationsRoadmapPanelComponent,
  ],
  templateUrl: './personalized-recommendations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalizedRecommendationsComponent {
  protected readonly recSvc = inject(PersonalizedRecommendationsService);

  protected onFilter(): void {
    this.recSvc.requestFilter();
  }

  protected onGenerateNew(): void {
    this.recSvc.requestGenerateNew();
  }

  protected onUpdateRoadmap(): void {
    this.recSvc.requestUpdateRoadmap();
  }

  protected onViewResource(): void {
    // Placeholder: future navigation or modal
  }

  protected onOpenResource(): void {
    // Placeholder: future external link or modal
  }

  protected dismissFilterNotice(): void {
    this.recSvc.clearFilterNotice();
  }

  protected dismissGenerateNotice(): void {
    this.recSvc.clearGenerateNotice();
  }

  protected dismissRoadmapNotice(): void {
    this.recSvc.clearRoadmapNotice();
  }
}
