import { Component, computed, input, output } from '@angular/core';
import type { RecommendationRule } from '../../../models/risk-analysis/recommendation-rule.model';
import {
  actionIconForResourceType,
  formatConditionDisplay,
  relativeTimeLabel,
} from '../../../models/risk-analysis/recommendation-rule.model';
import { STATUS_LABELS } from '../../../models/risk-analysis/recommendation-status.model';
import { PRIORITY_LABELS } from '../../../models/risk-analysis/recommendation-priority.model';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state.component';

@Component({
  selector: 'app-recommendation-rule-table',
  standalone: true,
  imports: [EmptyStateComponent],
  templateUrl: './recommendation-rule-table.component.html',
  styleUrl: './recommendation-rule-table.component.css',
})
export class RecommendationRuleTableComponent {
  readonly rows = input.required<RecommendationRule[]>();
  readonly page = input<number>(1);
  readonly pageSize = input<number>(10);
  readonly total = input<number>(0);
  readonly searchQuery = input<string>('');

  readonly edit = output<RecommendationRule>();
  readonly delete = output<RecommendationRule>();
  readonly pageChange = output<number>();
  readonly searchChange = output<string>();
  readonly filterClick = output<void>();

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly formatCondition = formatConditionDisplay;
  protected readonly actionIcon = actionIconForResourceType;
  protected readonly relativeTime = relativeTimeLabel;

  protected startIndex = computed(() => {
    const p = this.page() ?? 1;
    const size = this.pageSize() ?? 10;
    const t = this.total();
    if (t === 0) return 0;
    return (p - 1) * size + 1;
  });

  protected endIndex = computed(() => {
    const t = this.total();
    const p = this.page() ?? 1;
    const size = this.pageSize() ?? 10;
    return Math.min(p * size, t);
  });

  protected totalPages = computed(() =>
    Math.max(1, Math.ceil((this.total() || 0) / (this.pageSize() ?? 10)))
  );

  protected pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  protected conditionIcon(cond: ReturnType<typeof formatConditionDisplay>): string {
    switch (cond.icon) {
      case 'down':
        return 'keyboard_arrow_down';
      case 'up':
        return 'keyboard_arrow_up';
      default:
        return 'drag_handle';
    }
  }

  protected conditionIconClass(cond: ReturnType<typeof formatConditionDisplay>): string {
    switch (cond.icon) {
      case 'down':
        return 'text-red-600';
      case 'up':
        return 'text-blue-800';
      default:
        return 'text-slate-500';
    }
  }

  protected priorityClass(p: RecommendationRule['priority']): string {
    switch (p) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-blue-100 text-blue-900';
      default:
        return 'bg-slate-200 text-slate-600';
    }
  }

  onSearchInput(value: string): void {
    this.searchChange.emit(value);
  }
}
