import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StudentReadinessProfileService } from '../../../services/student-readiness-profile.service';

@Component({
  selector: 'app-student-profile-filter-bar',
  standalone: true,
  templateUrl: './student-profile-filter-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileFilterBarComponent {
  protected readonly svc = inject(StudentReadinessProfileService);

  protected onSearchInput(value: string): void {
    this.svc.setSearchQuery(value);
  }

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
}
