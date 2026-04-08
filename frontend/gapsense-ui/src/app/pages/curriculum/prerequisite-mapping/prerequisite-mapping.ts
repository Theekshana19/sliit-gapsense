import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberShellComponent } from '../../../components/layout/member-shell/member-shell.component';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { PrerequisiteFormComponent } from '../../../components/curriculum/prerequisite-form/prerequisite-form';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { Prerequisite } from '../../../models/curriculum/prerequisite.model';

// prerequisite mapping page - define or edit prerequisite relationships between modules
// edit mode triggers when route has :id param (loads existing prerequisite first)
@Component({
  selector: 'app-prerequisite-mapping',
  standalone: true,
  imports: [MemberShellComponent, LoadingSpinnerComponent, PrerequisiteFormComponent],
  templateUrl: './prerequisite-mapping.html',
})
export class PrerequisiteMappingComponent implements OnInit {
  private curriculumService = inject(CurriculumService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  isLoading = signal(false);
  prerequisite = signal<Prerequisite | null>(null);

  ngOnInit() {
    // check for edit mode from route param
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.isLoading.set(true);

      // backend doesn't have GET /api/prerequisites/{id} so we filter from the full list
      this.curriculumService.getPrerequisites().subscribe({
        next: (all) => {
          const found = all.find((p) => p.id === id);
          if (found) {
            this.prerequisite.set(found);
          } else {
            this.toastService.error('Prerequisite not found');
            this.router.navigate(['/curriculum/prerequisite-management']);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.toastService.error('Failed to load prerequisite');
          this.isLoading.set(false);
          this.router.navigate(['/curriculum/prerequisite-management']);
        },
      });
    }
  }

  onFormSubmit(data: Partial<Prerequisite>) {
    if (this.isEditMode()) {
      // update existing prerequisite
      const id = this.route.snapshot.paramMap.get('id')!;
      this.curriculumService.updatePrerequisite(id, data).subscribe({
        next: () => {
          this.toastService.success('Prerequisite updated successfully');
          this.router.navigate(['/curriculum/prerequisite-management']);
        },
        error: (err: any) => {
          this.toastService.error(err?.error?.message || 'Failed to update prerequisite');
        },
      });
    } else {
      // create new prerequisite
      this.curriculumService.createPrerequisite(data).subscribe({
        next: () => {
          this.toastService.success('Prerequisite mapping created successfully');
          this.router.navigate(['/curriculum/prerequisite-management']);
        },
        error: (err: any) => {
          this.toastService.error(err?.error?.message || 'Failed to create prerequisite');
        },
      });
    }
  }

  onFormCancel() {
    this.router.navigate(['/curriculum/prerequisite-management']);
  }
}
