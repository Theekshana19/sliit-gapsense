import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin, from } from 'rxjs';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import { CurriculumService } from '../../../services/curriculum.service';
import {
  OptionalModulesApiService,
  type StudentInterventionDto,
} from '../../../services/optional-modules-api.service';
import { ToastService } from '../../../services/toast.service';
import type { ValidationAlert } from '../../../models/curriculum/prerequisite.model';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [MemberShellComponent, LoadingSpinnerComponent, PillBadgeComponent, DatePipe],
  templateUrl: './notification-center.html',
})
export class NotificationCenterComponent implements OnInit {
  private readonly curriculum = inject(CurriculumService);
  private readonly optional = inject(OptionalModulesApiService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(true);
  readonly alerts = signal<ValidationAlert[]>([]);
  readonly interventions = signal<StudentInterventionDto[]>([]);

  ngOnInit(): void {
    forkJoin({
      alerts: this.curriculum.getValidationAlerts(),
      interventions: from(this.optional.fetchInterventions()),
    }).subscribe({
      next: ({ alerts, interventions }) => {
        this.alerts.set(Array.isArray(alerts) ? alerts : []);
        this.interventions.set(Array.isArray(interventions) ? interventions : []);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Could not load notification data.');
        this.isLoading.set(false);
      },
    });
  }

  severityVariant(s: string): 'primary' | 'error' | 'neutral' | 'success' {
    const x = (s || '').toLowerCase();
    if (x === 'critical') return 'error';
    if (x === 'warning') return 'primary';
    if (x === 'info') return 'success';
    return 'neutral';
  }

  interventionStatusVariant(s: string): 'primary' | 'error' | 'neutral' | 'success' {
    return s?.toLowerCase() === 'closed' ? 'neutral' : 'primary';
  }
}
