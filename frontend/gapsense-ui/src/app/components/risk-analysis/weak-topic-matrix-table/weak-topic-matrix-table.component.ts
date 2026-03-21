import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type {
  TopicMatrixStatus,
  WeaknessLevel,
  WeakTopicMatrixRow,
} from '../../../models/risk-analysis/weak-topic-row.model';
import { WeakTopicExportActionComponent } from '../weak-topic-export-action/weak-topic-export-action.component';

@Component({
  selector: 'app-weak-topic-matrix-table',
  standalone: true,
  imports: [WeakTopicExportActionComponent],
  templateUrl: './weak-topic-matrix-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeakTopicMatrixTableComponent {
  readonly rows = input.required<WeakTopicMatrixRow[]>();
  readonly exportDetailedPdf = output<void>();

  protected weaknessBadgeClass(level: WeaknessLevel): string {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-900';
      case 'moderate':
        return 'bg-slate-200 text-slate-800';
      case 'minor':
        return 'bg-slate-200/90 text-slate-700';
      default:
        return 'bg-blue-100 text-blue-900';
    }
  }

  protected weaknessLabel(level: WeaknessLevel): string {
    switch (level) {
      case 'critical':
        return 'Critical';
      case 'moderate':
        return 'Moderate';
      case 'minor':
        return 'Minor';
      default:
        return 'None';
    }
  }

  protected scoreBarClass(level: WeaknessLevel): string {
    switch (level) {
      case 'critical':
        return 'bg-red-600';
      case 'moderate':
        return 'bg-slate-600';
      case 'minor':
        return 'bg-blue-800';
      default:
        return 'bg-blue-700';
    }
  }

  protected scoreTextClass(level: WeaknessLevel): string {
    switch (level) {
      case 'critical':
        return 'text-red-600';
      case 'moderate':
        return 'text-slate-600';
      case 'minor':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  }

  protected statusIcon(status: TopicMatrixStatus): string {
    switch (status) {
      case 'immediate_action':
        return 'report';
      case 'scheduled_review':
        return 'pending';
      case 'self_study':
        return 'check_circle';
      default:
        return 'verified';
    }
  }

  protected statusText(status: TopicMatrixStatus): string {
    switch (status) {
      case 'immediate_action':
        return 'Immediate Action';
      case 'scheduled_review':
        return 'Scheduled Review';
      case 'self_study':
        return 'Self-Study Sug.';
      default:
        return 'Meeting Target';
    }
  }

  protected statusRowClass(status: TopicMatrixStatus): string {
    switch (status) {
      case 'immediate_action':
        return 'text-red-600';
      case 'meeting_target':
        return 'text-blue-800';
      default:
        return 'text-slate-600';
    }
  }

  protected rowHoverClass(level: WeaknessLevel): string {
    return level === 'critical' ? 'hover:bg-red-50/60' : 'hover:bg-slate-50';
  }
}
