import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { RecommendationRoadmapView } from '../../../models/risk-analysis/recommendation-roadmap-item.model';

@Component({
  selector: 'app-recommendations-roadmap-panel',
  standalone: true,
  templateUrl: './recommendations-roadmap-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsRoadmapPanelComponent {
  readonly roadmap = input.required<RecommendationRoadmapView>();

  readonly updateRoadmap = output<void>();

  protected stepClass(status: string): string {
    return status === 'completed'
      ? 'bg-blue-800 text-white'
      : 'bg-slate-200 text-slate-600';
  }
}
