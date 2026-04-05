import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import {
  ReadinessReportingService,
  type ReadinessResultListDto,
} from '../../../services/readiness-reporting.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-reports-export',
  standalone: true,
  imports: [MemberShellComponent, LoadingSpinnerComponent, PillBadgeComponent],
  templateUrl: './reports-export.html',
})
export class ReportsExportComponent implements OnInit {
  private readonly reporting = inject(ReadinessReportingService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(true);
  readonly rows = signal<ReadinessResultListDto[]>([]);

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

  riskVariant(level: string): 'primary' | 'error' | 'neutral' | 'success' {
    const l = (level || '').toLowerCase();
    if (l === 'high') return 'error';
    if (l === 'low') return 'success';
    return 'neutral';
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

  exportCsv(): void {
    const list = this.rows();
    if (!list.length) {
      this.toast.error('No rows to export.');
      return;
    }
    const headers = [
      'id',
      'studentName',
      'studentId',
      'moduleCode',
      'semesterLabel',
      'totalScorePercent',
      'riskLevel',
      'weakTopicsCount',
      'analysisDateLabel',
    ];
    const lines = [headers.join(',')];
    for (const r of list) {
      const cells = headers.map((h) => {
        const v = (r as unknown as Record<string, unknown>)[h];
        const s = v == null ? '' : String(v);
        const esc = s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        return esc;
      });
      lines.push(cells.join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `readiness-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.toast.success('CSV downloaded.');
  }
}
