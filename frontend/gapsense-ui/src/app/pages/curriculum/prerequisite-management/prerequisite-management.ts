import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { PillBadgeComponent } from '../../../components/ui/pill-badge/pill-badge.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { ConfirmPromptDialogComponent } from '../../../components/ui/confirm-dialog/confirm-prompt-dialog';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { Prerequisite, PrerequisiteStats } from '../../../models/curriculum/prerequisite.model';

// prerequisite management page - view all prerequisites for modules
// shows stats, prerequisite table, and recent activity
@Component({
  selector: 'app-prerequisite-management',
  standalone: true,
  imports: [MemberShellComponent, PillBadgeComponent, LoadingSpinnerComponent, ConfirmPromptDialogComponent],
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
    // calculate stats from the loaded prerequisites data
    this.curriculumService.getPrerequisites().subscribe((data) => {
      const stats = {
        activePrerequisites: data.length,
        mandatoryPaths: data.filter(p => p.relationshipType === 'Mandatory').length,
        avgRelevanceScore: data.length > 0
          ? Math.round(data.reduce((sum, p) => sum + p.relevanceWeight, 0) / data.length)
          : 0,
        depthLevels: 3,
      };
      this.stats.set(stats);
    });
  }

  goToAddMapping() {
    this.router.navigate(['/curriculum/prerequisite-mapping']);
  }

  // navigate to edit a prerequisite (reuses the mapping form page)
  goToEditMapping(prereq: Prerequisite) {
    // for now, navigate to the mapping page - full edit would need a separate route
    this.toastService.info('Edit functionality coming soon. Use delete and re-create for now.');
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
