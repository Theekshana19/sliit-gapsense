import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { StudentProfileSummaryView } from '../../../models/risk-analysis/student-profile-summary.model';

@Component({
  selector: 'app-student-profile-summary-card',
  standalone: true,
  templateUrl: './student-profile-summary-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileSummaryCardComponent {
  readonly summary = input.required<StudentProfileSummaryView>();

  protected statusBadgeClass(status: string): string {
    return status === 'active'
      ? 'bg-blue-100 text-blue-900'
      : status === 'at-risk'
        ? 'bg-red-100 text-red-800'
        : 'bg-slate-200 text-slate-600';
  }

  protected statusLabel(status: string): string {
    return status === 'active' ? 'ACTIVE' : status === 'at-risk' ? 'AT RISK' : 'INACTIVE';
  }
}
