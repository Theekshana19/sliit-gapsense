import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { RecommendationRuleSummaryCardsComponent } from '../../../components/risk-analysis/recommendation-rule-summary-cards/recommendation-rule-summary-cards.component';
import { RecommendationRuleTableComponent } from '../../../components/risk-analysis/recommendation-rule-table/recommendation-rule-table.component';
import { RecommendationRuleHelpFabComponent } from '../../../components/risk-analysis/recommendation-rule-help-fab/recommendation-rule-help-fab.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import type { RecommendationRule } from '../../../models/risk-analysis/recommendation-rule.model';
import { RecommendationRuleService } from '../../../services/recommendation-rule.service';

@Component({
  selector: 'app-recommendation-rule-management',
  standalone: true,
  imports: [
    TopBarComponent,
    SidebarComponent,
    RecommendationRuleSummaryCardsComponent,
    RecommendationRuleTableComponent,
    RecommendationRuleHelpFabComponent,
    ModalComponent,
  ],
  templateUrl: './recommendation-rule-management.component.html',
  styleUrl: './recommendation-rule-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationRuleManagementComponent {
  private readonly router = inject(Router);
  protected readonly service = inject(RecommendationRuleService);

  protected readonly pageSize = 10;
  protected readonly searchQuery = signal('');
  protected readonly filterPanelOpen = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly confirmDeleteRule = signal<RecommendationRule | null>(null);

  protected readonly filteredRules = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const all = this.service.rules();
    if (!q) return all;
    return all.filter(
      (r) =>
        r.ruleName.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.recommendedActionSummary.toLowerCase().includes(q)
    );
  });

  protected readonly paginatedRows = computed(() => {
    const all = this.filteredRules();
    const page = this.currentPage();
    const size = this.pageSize;
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  protected readonly totalFiltered = computed(() => this.filteredRules().length);

  protected readonly deleteConfirmMessage = computed(() => {
    const r = this.confirmDeleteRule();
    if (!r) return '';
    return `Are you sure you want to delete "${r.ruleName}"? This action cannot be undone.`;
  });

  protected onSearchChange(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  protected toggleFilter(): void {
    this.filterPanelOpen.update((v) => !v);
  }

  protected addRule(): void {
    this.router.navigate(['/recommendation-rules/add']);
  }

  protected editRule(rule: RecommendationRule): void {
    this.router.navigate(['/recommendation-rules', rule.id, 'edit']);
  }

  protected requestDelete(rule: RecommendationRule): void {
    this.confirmDeleteRule.set(rule);
  }

  protected cancelDelete(): void {
    this.confirmDeleteRule.set(null);
  }

  protected confirmDelete(): void {
    const r = this.confirmDeleteRule();
    if (r) {
      this.service.delete(r.id);
      this.confirmDeleteRule.set(null);
    }
  }
}
