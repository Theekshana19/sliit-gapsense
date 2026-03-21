import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { PrerequisiteFormComponent } from '../../../components/curriculum/prerequisite-form/prerequisite-form';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { Prerequisite } from '../../../models/curriculum/prerequisite.model';

// prerequisite mapping page - define prerequisite relationships between modules
@Component({
  selector: 'app-prerequisite-mapping',
  standalone: true,
  imports: [MainLayoutComponent, PrerequisiteFormComponent],
  templateUrl: './prerequisite-mapping.html',
})
export class PrerequisiteMappingComponent {
  private curriculumService = inject(CurriculumService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  onFormSubmit(data: Partial<Prerequisite>) {
    this.curriculumService.createPrerequisite(data).subscribe(() => {
      this.toastService.success('Prerequisite mapping created successfully');
      this.router.navigate(['/curriculum/prerequisite-management']);
    });
  }

  onFormCancel() {
    this.router.navigate(['/curriculum/prerequisite-management']);
  }
}
