import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { StatusBadgeComponent } from '../../../components/ui/status-badge/status-badge';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { ConfirmDialogComponent } from '../../../components/ui/confirm-dialog/confirm-dialog';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { Prerequisite, PrerequisiteStats } from '../../../models/curriculum/prerequisite.model';

// prerequisite management page - view all prerequisites for modules
// shows stats, prerequisite table, and recent activity
@Component({
  selector: 'app-prerequisite-management',
  standalone: true,
  imports: [MainLayoutComponent, StatusBadgeComponent, LoadingSpinnerComponent, ConfirmDialogComponent],
  templateUrl: './prerequisite-management.html',
})
export class PrerequisiteManagementComponent implements OnInit {
  private curriculumService = inject(CurriculumService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isLoading = signal(true);
  prerequisites = signal<Prerequisite[]>([]);
  stats = signal<PrerequisiteStats>({ activePrerequisites: 0, mandatoryPaths: 0, avgRelevanceScore: 0, depthLevels: 0 });

  showDeleteDialog = signal(false);
  prereqToDelete = signal<Prerequisite | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.curriculumService.getPrerequisites().subscribe((data) => {
      this.prerequisites.set(data);
      this.isLoading.set(false);
    });
    this.curriculumService.getPrerequisiteStats('').subscribe((s) => this.stats.set(s));
  }

  goToAddMapping() {
    this.router.navigate(['/curriculum/prerequisite-mapping']);
  }

  goToVisualization() {
    this.router.navigate(['/curriculum/dependency-visualization']);
  }

  confirmDelete(prereq: Prerequisite) {
    this.prereqToDelete.set(prereq);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed() {
    const p = this.prereqToDelete();
    if (p) {
      this.curriculumService.deletePrerequisite(p.id).subscribe(() => {
        this.toastService.success('Prerequisite removed');
        this.showDeleteDialog.set(false);
        this.prereqToDelete.set(null);
        this.loadData();
      });
    }
  }

  onDeleteCancelled() {
    this.showDeleteDialog.set(false);
    this.prereqToDelete.set(null);
  }

  getTypeVariant(type: string): 'primary' | 'neutral' {
    return type === 'Mandatory' ? 'primary' : 'neutral';
  }

  getStatusVariant(status: string): 'primary' | 'error' | 'neutral' {
    switch (status) {
      case 'Validated': return 'primary';
      case 'Review Required': return 'error';
      default: return 'neutral';
    }
  }
}
