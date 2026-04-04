import { Component, inject, signal, OnInit } from '@angular/core';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { StatusBadgeComponent } from '../../../components/ui/status-badge/status-badge';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { ValidationAlert, ValidationStats } from '../../../models/curriculum/prerequisite.model';

// validation alerts page - monitor and resolve system-wide issues
// shows circular dependencies, missing weights, duplicate mappings, etc.
@Component({
  selector: 'app-validation-alerts',
  standalone: true,
  imports: [MainLayoutComponent, StatusBadgeComponent, LoadingSpinnerComponent],
  templateUrl: './validation-alerts.html',
})
export class ValidationAlertsComponent implements OnInit {
  private curriculumService = inject(CurriculumService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  alerts = signal<ValidationAlert[]>([]);
  stats = signal<ValidationStats>({ criticalCount: 0, complianceScore: 0, checksPassed: 0 });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.curriculumService.getValidationAlerts().subscribe((data) => {
      this.alerts.set(data);
      this.isLoading.set(false);
    });
    this.curriculumService.getValidationStats().subscribe((s) => this.stats.set(s));
  }

  // get severity badge variant
  getSeverityVariant(severity: string): 'error' | 'primary' | 'neutral' {
    switch (severity) {
      case 'Critical': return 'error';
      case 'Warning': return 'primary';
      default: return 'neutral';
    }
  }

  // get alert type icon
  getAlertIcon(type: string): string {
    switch (type) {
      case 'Circular Dependency': return 'sync_problem';
      case 'Duplicate Mapping': return 'content_copy';
      case 'Missing Topic Weight': return 'scale';
      case 'Incomplete Setup': return 'pending';
      default: return 'warning';
    }
  }

  // get status badge variant
  getStatusVariant(status: string): 'error' | 'primary' | 'success' {
    switch (status) {
      case 'Unresolved': return 'error';
      case 'In Progress': return 'primary';
      default: return 'success';
    }
  }

  // mark alert as in progress
  startResolving(alert: ValidationAlert) {
    this.curriculumService.updateAlertStatus(alert.id, 'In Progress').subscribe(() => {
      this.toastService.info('Alert marked as In Progress');
      this.loadData();
    });
  }

  // mark alert as resolved
  resolveAlert(alert: ValidationAlert) {
    this.curriculumService.updateAlertStatus(alert.id, 'Resolved').subscribe(() => {
      this.toastService.success('Alert resolved');
      this.loadData();
    });
  }
}
