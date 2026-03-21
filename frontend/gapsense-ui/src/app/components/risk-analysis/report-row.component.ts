import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RiskReport } from '../../models/risk-analysis/risk-analysis.model';
import { StatusPillComponent, StatusPillTone } from '../ui/status-pill/status-pill.component';

@Component({
  standalone: true,
  selector: 'app-report-row',
  imports: [StatusPillComponent, DatePipe],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-slate-900">{{ item.title }}</h3>
          <p class="mt-1 text-xs text-slate-500">{{ item.generatedAt | date: 'medium' }}</p>
        </div>
        <app-status-pill [label]="severityLabel" [tone]="severityTone" />
      </div>
      <p class="mt-3 text-sm text-slate-600">{{ item.summary }}</p>
    </div>
  `,
})
export class ReportRowComponent {
  @Input({ required: true }) item!: RiskReport;

  get severityLabel(): string {
    return this.item.severity.charAt(0).toUpperCase() + this.item.severity.slice(1);
  }

  get severityTone(): StatusPillTone {
    if (this.item.severity === 'high') {
      return 'danger';
    }
    if (this.item.severity === 'medium') {
      return 'warning';
    }
    return 'success';
  }
}
