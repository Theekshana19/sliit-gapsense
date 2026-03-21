import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WeakTopicAnalysisService } from '../../../services/weak-topic-analysis.service';

@Component({
  selector: 'app-weak-topic-filter-bar',
  standalone: true,
  templateUrl: './weak-topic-filter-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeakTopicFilterBarComponent {
  protected readonly svc = inject(WeakTopicAnalysisService);

  protected onSemesterChange(id: string): void {
    this.svc.setSemesterId(id);
  }

  protected onBatchChange(id: string): void {
    this.svc.setBatchId(id);
  }

  protected onGroupChange(id: string): void {
    this.svc.setGroupId(id);
  }

  protected onStudentChange(id: string): void {
    this.svc.setStudentId(id);
  }

  protected onModuleChange(id: string): void {
    this.svc.setModuleId(id);
  }
}
