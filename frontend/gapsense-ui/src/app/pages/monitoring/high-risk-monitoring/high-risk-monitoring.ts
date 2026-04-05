import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import {
  ReadinessReportingService,
  type ReadinessResultListDto,
} from '../../../services/readiness-reporting.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-high-risk-monitoring',
  standalone: true,
  imports: [MemberShellComponent, LoadingSpinnerComponent, PillBadgeComponent],
  templateUrl: './high-risk-monitoring.html',
})
export class HighRiskMonitoringComponent implements OnInit {
  private readonly reporting = inject(ReadinessReportingService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(true);
  readonly rows = signal<ReadinessResultListDto[]>([]);

  readonly highRiskRows = computed(() =>
    this.rows().filter((r) => (r.riskLevel || '').toLowerCase() === 'high')
  );

  ngOnInit(): void {
    this.reporting.listResults().subscribe({
      next: (list) => {
        this.rows.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Could not load readiness results.');
        this.isLoading.set(false);
      },
    });
  }

  downloadPdf(row: ReadinessResultListDto): void {
    this.reporting.exportPdfBlob(row.id).subscribe({
      next: (blob) => {
        if (!blob?.size) {
          this.toast.error('Empty PDF from server.');
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `readiness-${row.studentId}-${row.moduleCode}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('PDF export failed.'),
    });
  }
}
