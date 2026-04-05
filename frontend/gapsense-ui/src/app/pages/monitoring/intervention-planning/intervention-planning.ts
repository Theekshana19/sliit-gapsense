import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import {
  OptionalModulesApiService,
  type StudentInterventionDto,
} from '../../../services/optional-modules-api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-intervention-planning',
  standalone: true,
  imports: [MemberShellComponent, LoadingSpinnerComponent, PillBadgeComponent, FormsModule, DatePipe],
  templateUrl: './intervention-planning.html',
})
export class InterventionPlanningComponent implements OnInit {
  private readonly api = inject(OptionalModulesApiService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(true);
  readonly saving = signal(false);
  readonly items = signal<StudentInterventionDto[]>([]);

  filterStudentUserId = '';

  formStudentUserId = '';
  formTitle = '';
  formNotes = '';
  formStatus: 'open' | 'closed' = 'open';

  ngOnInit(): void {
    void this.reload();
  }

  async reload(): Promise<void> {
    this.isLoading.set(true);
    try {
      const q = this.filterStudentUserId.trim() || undefined;
      const list = await this.api.fetchInterventions(q);
      this.items.set(list);
    } catch {
      this.toast.error('Could not load interventions.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async applyFilter(): Promise<void> {
    await this.reload();
  }

  async clearFilter(): Promise<void> {
    this.filterStudentUserId = '';
    await this.reload();
  }

  async submit(): Promise<void> {
    const sid = this.formStudentUserId.trim();
    const title = this.formTitle.trim();
    if (!sid || !title) {
      this.toast.error('Student user ID (GUID) and title are required.');
      return;
    }
    const guidOk = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sid);
    if (!guidOk) {
      this.toast.error('Student user ID must be the student’s account GUID (not the registration number).');
      return;
    }

    this.saving.set(true);
    const ok = await this.api.createIntervention({
      studentUserId: sid,
      title,
      notes: this.formNotes.trim() || null,
      status: this.formStatus,
    });
    this.saving.set(false);

    if (ok) {
      this.toast.success('Intervention / follow-up recorded.');
      this.formTitle = '';
      this.formNotes = '';
      this.formStatus = 'open';
      await this.reload();
    } else {
      this.toast.error('Could not create intervention. Check the student GUID exists.');
    }
  }

  statusVariant(s: string): 'primary' | 'error' | 'neutral' | 'success' {
    return s?.toLowerCase() === 'closed' ? 'neutral' : 'error';
  }
}
