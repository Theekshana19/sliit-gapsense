import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ProjectionSummaryView } from '../../../models/risk-analysis/projection-summary.model';

@Component({
  selector: 'app-weak-topic-projection-panel',
  standalone: true,
  templateUrl: './weak-topic-projection-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeakTopicProjectionPanelComponent {
  readonly projection = input.required<ProjectionSummaryView>();
  /** Full student dropdown label, e.g. "Jayasekara, A. (IT210452)" */
  readonly studentLabel = input.required<string>();

  protected readonly insightParts = computed(() => {
    const p = this.projection();
    const name = this.studentLabel().split('(')[0]?.trim() ?? this.studentLabel();
    const pct = p.insightHighlightPercent;
    const tpl = p.insightTemplate;
    const withName = tpl.replace('{{name}}', name);
    const parts = withName.split('{{percent}}');
    return {
      before: parts[0] ?? '',
      highlight: String(pct),
      after: parts[1] ?? '',
    };
  });

  protected barClass(variant: 'historical' | 'projection'): string {
    return variant === 'projection'
      ? 'bg-blue-600/90 border-t-4 border-blue-200'
      : 'bg-white/10';
  }
}
