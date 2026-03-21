import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RiskAnalysisService } from '../../../services/risk-analysis.service';
import type { RiskThreshold } from '../../../models/risk-analysis/risk-threshold.model';
import type { RiskThresholdFormValue } from '../../../models/risk-analysis/risk-threshold-form.model';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { ThresholdSummaryCardsComponent } from '../../../components/risk-analysis/threshold-summary-cards/threshold-summary-cards.component';
import { ThresholdTableComponent } from '../../../components/risk-analysis/threshold-table/threshold-table.component';
import { ThresholdFormPanelComponent } from '../../../components/risk-analysis/threshold-form-panel/threshold-form-panel.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';

@Component({
  selector: 'app-risk-threshold-management',
  standalone: true,
  imports: [
    TopBarComponent,
    SidebarComponent,
    ThresholdSummaryCardsComponent,
    ThresholdTableComponent,
    ThresholdFormPanelComponent,
    ModalComponent,
  ],
  templateUrl: './risk-threshold-management.component.html',
  styleUrl: './risk-threshold-management.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskThresholdManagementComponent {
  private readonly service = inject(RiskAnalysisService);

  protected readonly pageSize = 10;

  readonly panelOpen = signal(false);
  readonly panelMode = signal<'create' | 'edit'>('create');
  readonly editingThreshold = signal<RiskThreshold | null>(null);
  readonly confirmDeleteThreshold = signal<RiskThreshold | null>(null);
  readonly currentPage = signal(1);

  readonly thresholds = this.service.thresholds;
  readonly activeCount = this.service.activeCount;
  readonly lastUpdatedAt = this.service.lastUpdatedAt;

  readonly paginatedRows = computed(() => {
    const all = this.thresholds();
    const page = this.currentPage();
    const size = this.pageSize;
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  readonly lastUpdatedLabel = computed(() => {
    const iso = this.lastUpdatedAt();
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '—';
    }
  });

  readonly firstThreshold = computed(() => this.thresholds()[0] ?? null);

  readonly deleteConfirmMessage = computed(() => {
    const t = this.confirmDeleteThreshold();
    if (!t) return '';
    return `Are you sure you want to delete "${t.ruleName}"? This action cannot be undone.`;
  });

  readonly summaryHighLabel = computed(() => {
    const t = this.firstThreshold();
    return t ? `< ${t.highRiskMax}%` : '< 50%';
  });

  readonly summaryLowLabel = computed(() => {
    const t = this.firstThreshold();
    return t ? `> ${t.lowRiskMin}%` : '> 75%';
  });

  readonly summaryHighPercent = computed(() => this.firstThreshold()?.highRiskMax ?? 50);
  readonly summaryLowPercent = computed(() => this.firstThreshold()?.lowRiskMin ?? 75);

  openAddPanel(): void {
    this.editingThreshold.set(null);
    this.panelMode.set('create');
    this.panelOpen.set(true);
  }

  openEditPanel(threshold: RiskThreshold): void {
    this.editingThreshold.set(threshold);
    this.panelMode.set('edit');
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.panelOpen.set(false);
    this.editingThreshold.set(null);
  }

  onSave(value: RiskThresholdFormValue): void {
    const mode = this.panelMode();
    const editing = this.editingThreshold();
    if (mode === 'edit' && editing) {
      this.service.update(editing.id, value);
    } else {
      this.service.add(value);
    }
    this.closePanel();
  }

  requestDelete(threshold: RiskThreshold): void {
    this.confirmDeleteThreshold.set(threshold);
  }

  cancelDelete(): void {
    this.confirmDeleteThreshold.set(null);
  }

  confirmDelete(): void {
    const t = this.confirmDeleteThreshold();
    if (t) {
      this.service.delete(t.id);
      this.confirmDeleteThreshold.set(null);
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }
}
